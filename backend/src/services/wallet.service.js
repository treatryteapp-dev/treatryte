const crypto = require('crypto');

const walletModel = require('../models/wallet.model');
const transactionModel = require('../models/transaction.model');
const userModel = require('../models/user.model');
const nomba = require('../nomba');
const activityService = require('./activity.service');
const notificationService = require('./notification.service');
const { ApiError } = require('../middleware/errorHandler');

async function getWallet(userId) {
  const wallet = await walletModel.findByUserId(userId);
  if (!wallet) {
    throw new ApiError(404, 'Wallet not found', 'WALLET_NOT_FOUND');
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

async function fundWallet(userId, { amountKobo, callbackUrl }) {
  const [wallet, user] = await Promise.all([getWallet(userId), userModel.findById(userId)]);

  // Create our own pending row first so we have an _id to finalize against
  // once Nomba's webhook arrives, then swap in Nomba's own orderReference
  // (Nomba ignores/replaces any reference we send, so theirs is the one
  // that will actually show up in the webhook payload).
  const pending = await transactionModel.recordPending({
    userId,
    walletId: wallet._id,
    type: 'credit',
    category: 'wallet_funding',
    amount: amountKobo,
    description: 'Wallet funding via Nomba',
    metadata: {},
    refs: {},
  });

  const order = await nomba.createCheckoutOrder({
    amountKobo,
    customerEmail: user.email,
    customerId: userId.toString(),
    orderReference: pending._id.toString(),
    callbackUrl,
  });

  await transactionModel.collection().updateOne(
    { _id: pending._id },
    { $set: { nombaOrderReference: order.orderReference, updatedAt: new Date() } },
  );

  return { checkoutLink: order.checkoutLink, orderReference: order.orderReference };
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

/**
 * Generic "pay a provider by reference code" flow - debits the wallet
 * immediately. There's no billers/providers directory in scope yet, so this
 * intentionally does not integrate with any downstream provider API.
 */
async function payProvider(userId, { amountKobo, providerCode, narration }) {
  const transaction = await debitImmediate(userId, {
    amountKobo,
    category: 'service_payment',
    description: `Payment to provider ${providerCode}`,
    metadata: { providerCode, narration },
    refs: {},
  });

  await activityService.record(userId, {
    type: 'service_payment',
    title: 'Provider Payment',
    subtitle: `₦${(amountKobo / 100).toLocaleString()} paid to ${providerCode}`,
    iconKey: 'arrow_upward',
  });

  return transaction;
}

async function lookupAccount({ accountNumber, bankCode }) {
  return nomba.lookupBankAccount({ accountNumber, bankCode });
}

/**
 * Central handler for all 6 Nomba webhook event types. Idempotent: relies
 * on transactionModel's pending-row lookups only mutating state once.
 */
async function handleNombaWebhook(eventType, data) {
  switch (eventType) {
    case 'payment_success': {
      const pending = await transactionModel.findByNombaOrderReference(data.orderReference);
      if (!pending || pending.status !== 'pending') return; // unknown or already handled

      await transactionModel.finalizePendingCredit(pending._id, data.transactionId);
      await activityService.record(pending.userId, {
        type: 'wallet_funding',
        title: 'Wallet Funded',
        subtitle: `₦${(pending.amount / 100).toLocaleString()} credited`,
        iconKey: 'account_balance_wallet',
      });
      await notificationService.notify(pending.userId, {
        type: 'wallet',
        title: 'Wallet Funded',
        body: `₦${(pending.amount / 100).toLocaleString()} has been credited to your wallet.`,
      });
      return;
    }
    case 'payment_failed':
    case 'payment_reversal': {
      const pending = await transactionModel.findByNombaOrderReference(data.orderReference);
      if (!pending || pending.status !== 'pending') return;
      await transactionModel.markFailed(pending._id);
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
  fundWallet,
  withdrawToBank,
  listBanks,
  lookupAccount,
  payProvider,
  handleNombaWebhook,
};
