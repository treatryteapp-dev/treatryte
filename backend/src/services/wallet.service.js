const crypto = require('crypto');

const walletModel = require('../models/wallet.model');
const transactionModel = require('../models/transaction.model');
const userModel = require('../models/user.model');
const nomba = require('../nomba');
const activityService = require('./activity.service');
const notificationService = require('./notification.service');
const { ApiError } = require('../middleware/errorHandler');

async function getWallet(userId) {
  let wallet = await walletModel.findByUserId(userId);
  if (!wallet) {
    wallet = await walletModel.createForUser(userId);
  }
  return wallet;
}

async function listTransactions(userId, options) {
  return transactionModel.list(userId, options);
}

/**
 * Immediately credits the wallet - used for dev-credit (Phase 3, no Nomba)
 * and any other flow where money is already confirmed in hand.
 */
async function creditImmediate(userId, { amountKobo, category, description, metadata, refs }) {
  const wallet = await getWallet(userId);
  return transactionModel.applyImmediate({
    userId,
    walletId: wallet._id,
    type: 'credit',
    category,
    amount: amountKobo,
    description,
    metadata,
    refs,
  });
}

/**
 * Immediately debits the wallet after checking sufficient balance - used for
 * service payments (appointment booking) where funds must leave the wallet
 * right away, not pending on an external webhook.
 */
async function debitImmediate(userId, { amountKobo, category, description, metadata, refs }) {
  const wallet = await getWallet(userId);
  if (wallet.balance < amountKobo) {
    throw new ApiError(422, 'Insufficient wallet balance', 'INSUFFICIENT_FUNDS');
  }
  return transactionModel.applyImmediate({
    userId,
    walletId: wallet._id,
    type: 'debit',
    category,
    amount: amountKobo,
    description,
    metadata,
    refs,
  });
}

/**
 * Returns this user's permanent dedicated virtual account, creating it on
 * first use. accountRef is the userId itself - stable and unique, so it
 * doubles as the natural idempotency key if this is ever called twice
 * concurrently (Nomba would just return/reuse the same account).
 */
async function getOrCreateVirtualAccount(userId) {
  const wallet = await getWallet(userId);
  if (wallet.virtualAccountNumber) {
    return {
      accountNumber: wallet.virtualAccountNumber,
      bankName: wallet.virtualBankName,
    };
  }

  const user = await userModel.findById(userId);
  let safeName = user.fullName || 'User';
  if (safeName.length < 8) safeName = safeName.padEnd(8, ' ');

  const account = await nomba.createVirtualAccount({
    accountRef: userId.toString(),
    accountName: safeName,
  });

  await walletModel.setVirtualAccount(userId, {
    virtualAccountNumber: account.bankAccountNumber,
    virtualBankName: account.bankName,
    virtualAccountRef: account.accountRef,
  });

  return { accountNumber: account.bankAccountNumber, bankName: account.bankName };
}

async function withdrawToBank(userId, { amountKobo, accountNumber, bankCode, accountName, narration }) {
  const merchantTxRef = `wd_${userId.toString()}_${crypto.randomUUID()}`;
  const user = await userModel.findById(userId);

  // Reserve the funds immediately so the balance can't be double-spent while
  // the payout is in flight; refunded automatically if Nomba reports failure.
  const debit = await debitImmediate(userId, {
    amountKobo,
    category: 'withdrawal',
    description: `Withdrawal to ${accountName} (${accountNumber})`,
    metadata: { accountNumber, bankCode, accountName, narration, nombaStatus: 'submitted' },
    refs: { nombaTransferRef: merchantTxRef },
  });

  try {
    const transfer = await nomba.transferToBank({
      amountKobo,
      accountNumber,
      bankCode,
      accountName,
      senderName: user.fullName,
      merchantTxRef,
      narration,
    });

    await transactionModel.collection().updateOne(
      { _id: debit._id },
      {
        $set: {
          'metadata.nombaStatus': transfer.pending ? 'pending' : 'success',
          updatedAt: new Date(),
        },
      },
    );

    await activityService.record(userId, {
      type: 'wallet_withdrawal',
      title: 'Withdrawal Initiated',
      subtitle: `₦${(amountKobo / 100).toLocaleString()} to ${accountName}`,
      iconKey: 'arrow_upward',
    });

    return { ...debit, nombaStatus: transfer.pending ? 'pending' : 'success' };
  } catch (error) {
    // Nomba rejected the transfer outright (not a webhook-delivered
    // failure) - refund immediately rather than leaving the user's money
    // stuck in limbo.
    await creditImmediate(userId, {
      amountKobo,
      category: 'refund',
      description: 'Withdrawal failed - refund',
      metadata: { originalTransactionId: debit._id.toString() },
      refs: {},
    });
    throw new ApiError(502, `Withdrawal failed: ${error.message}`, 'WITHDRAWAL_FAILED');
  }
}

async function listBanks() {
  return nomba.listBanks();
}

async function lookupAccount({ accountNumber, bankCode }) {
  return nomba.lookupBankAccount({ accountNumber, bankCode });
}

/**
 * Central handler for all 6 Nomba webhook event types. Idempotent: relies
 * on transactionModel's pending-row lookups only mutating state once.
 */
async function handleNombaWebhook(eventType, rawData) {
  const data = nomba.parseWebhookData(rawData);
  switch (eventType) {
    case 'payment_success': {      if (data.type === 'vact_transfer' && (data.aliasAccountNumber || data.aliasAccountReference)) {
        if (data.transactionId) {
          const existing = await transactionModel.findByNombaTransactionId(data.transactionId);
          if (existing) return; // already credited - webhook retry
        }
        // Match by account number first (unambiguous - it's literally what
        // we store as virtualAccountNumber); accountRef as a fallback in
        // case Nomba ever omits the number on some payload variant.
        const wallet =
          (data.aliasAccountNumber &&
            (await walletModel.findByVirtualAccountNumber(data.aliasAccountNumber))) ||
          (data.aliasAccountReference &&
            (await walletModel.findByVirtualAccountRef(data.aliasAccountReference)));
        if (!wallet || !data.amountKobo) return; // unknown virtual account, or unparseable amount

        const credit = await creditImmediate(wallet.userId, {
          amountKobo: data.amountKobo,
          category: 'wallet_funding',
          description: 'Wallet funding via bank transfer',
          metadata: {},
          refs: data.transactionId ? { nombaTransactionId: data.transactionId } : {},
        });
        await activityService.record(wallet.userId, {
          type: 'wallet_funding',
          title: 'Wallet Funded',
          subtitle: `₦${(data.amountKobo / 100).toLocaleString()} credited`,
          iconKey: 'account_balance_wallet',
        });
        await notificationService.notify(wallet.userId, {
          type: 'wallet',
          title: 'Wallet Funded',
          body: `₦${(data.amountKobo / 100).toLocaleString()} has been credited to your wallet.`,
        });
        return credit;
      }
      return;
    }

    case 'payout_success': {
      const existing = await transactionModel.findByNombaTransferRef(data.transferReference);
      if (!existing) return;
      await transactionModel.collection().updateOne(
        { _id: existing._id },
        { $set: { 'metadata.nombaStatus': 'success', updatedAt: new Date() } },
      );
      return;
    }
    case 'payout_failed':
    case 'payout_refund': {
      const existing = await transactionModel.findByNombaTransferRef(data.transferReference);
      if (!existing || existing.metadata?.nombaStatus === 'refunded') return; // already refunded

      await creditImmediate(existing.userId, {
        amountKobo: existing.amount,
        category: 'refund',
        description: 'Withdrawal failed - refund',
        metadata: { originalTransactionId: existing._id.toString() },
        refs: {},
      });
      await transactionModel.collection().updateOne(
        { _id: existing._id },
        { $set: { 'metadata.nombaStatus': 'refunded', updatedAt: new Date() } },
      );
      await notificationService.notify(existing.userId, {
        type: 'wallet',
        title: 'Withdrawal Failed',
        body: `Your withdrawal of ₦${(existing.amount / 100).toLocaleString()} failed and has been refunded.`,
      });
      return;
    }
    default:
      return;
  }
}

module.exports = {
  getWallet,
  listTransactions,
  creditImmediate,
  debitImmediate,
  getOrCreateVirtualAccount,
  withdrawToBank,
  listBanks,
  lookupAccount,
  handleNombaWebhook,
};
