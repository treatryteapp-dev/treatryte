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
  const account = await nomba.createVirtualAccount({
    accountRef: userId.toString(),
    accountName: user.fullName,
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
 * Shared by the webhook path and the direct-reconciliation path below - both
 * end with the same credit + activity + notification once Nomba confirms a
 * funding order actually succeeded.
 */
async function finalizeFundingSuccess(pending, nombaTransactionId) {
  await transactionModel.finalizePendingCredit(pending._id, nombaTransactionId);
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
}

/**
 * Central handler for all 6 Nomba webhook event types. Idempotent: relies
 * on transactionModel's pending-row lookups only mutating state once.
 */
async function handleNombaWebhook(eventType, rawData) {
  const data = nomba.parseWebhookData(rawData);
  switch (eventType) {
    case 'payment_success': {
      // Checkout-order payments (card, or pay-by-transfer through the
      // checkout page) carry data.order.orderReference; dedicated-virtual-
      // account transfers don't - they're identified by aliasAccountReference
      // instead and have no pre-existing pending row to finalize.
      if (data.orderReference) {
        const pending = await transactionModel.findByNombaOrderReference(data.orderReference);
        if (!pending || pending.status !== 'pending') return; // unknown or already handled

        await finalizeFundingSuccess(pending, data.transactionId);
        return;
      }

      if (data.type === 'vact_transfer' && data.aliasAccountReference) {
        if (data.transactionId) {
          const existing = await transactionModel.findByNombaTransactionId(data.transactionId);
          if (existing) return; // already credited - webhook retry
        }
        const wallet = await walletModel.findByVirtualAccountRef(data.aliasAccountReference);
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

/**
 * Looks up a specific pending funding order directly against Nomba and
 * settles it - the on-demand counterpart to handleNombaWebhook, for the
 * moment right after checkout when we don't want to just sit and hope the
 * webhook shows up. Scoped to userId so a caller can't probe/settle another
 * user's order by guessing an orderReference.
 */
async function reconcileFunding(userId, orderReference) {
  const pending = await transactionModel.findByNombaOrderReference(orderReference);
  if (!pending || pending.userId.toString() !== userId.toString()) {
    throw new ApiError(404, 'Funding order not found', 'ORDER_NOT_FOUND');
  }
  if (pending.status !== 'pending') {
    return { status: pending.status };
  }

  const result = await nomba.verifyTransaction({ orderReference });
  // No confirmed terminal-failure signal from this endpoint (only
  // "found and paid" vs "not found/not paid yet") - never mark 'failed'
  // from it, only ever move a pending order forward to 'success'. A
  // genuinely failed/abandoned checkout just stays 'pending' indefinitely,
  // which is the safe default (matches the payment_failed webhook path,
  // which still handles explicit failures separately).
  if (result?.success) {
    await finalizeFundingSuccess(pending, result.transactionId);
    return { status: 'success' };
  }
  return { status: 'pending' };
}

/**
 * Sweeps funding orders stuck 'pending' well past the normal webhook-delivery
 * window and settles them directly against Nomba - the background safety net
 * for a webhook that was missed, rejected, or never delivered. Meant to be
 * run on an interval (see server.js); failures for one order never block the
 * rest of the sweep.
 */
async function reconcileStalePendingFundings() {
  const stale = await transactionModel.findStalePendingFundings({
    olderThanMs: 5 * 60 * 1000, // give the webhook 5 minutes before we check
    newerThanMs: 3 * 24 * 60 * 60 * 1000, // beyond 3 days, Nomba's own record is unlikely to help either
  });

  for (const pending of stale) {
    try {
      await reconcileFunding(pending.userId, pending.nombaOrderReference);
    } catch (error) {
      console.error(`Stale funding reconciliation failed for ${pending.nombaOrderReference}:`, error.message);
    }
  }
}

module.exports = {
  getWallet,
  listTransactions,
  creditImmediate,
  debitImmediate,
  fundWallet,
  getOrCreateVirtualAccount,
  withdrawToBank,
  listBanks,
  lookupAccount,
  handleNombaWebhook,
  reconcileFunding,
  reconcileStalePendingFundings,
};
