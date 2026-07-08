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

  const targetWallet = await walletModel.findByVirtualAccountNumber(accountNumber);
  if (targetWallet) {
    // Intercept internal platform transfers
    const debit = await debitImmediate(userId, {
      amountKobo,
      category: 'transfer',
      description: `Internal transfer to ${accountName}`,
      metadata: { isInternal: true, recipientWalletId: targetWallet._id.toString() },
      refs: {},
    });

    await creditImmediate(targetWallet.userId, {
      amountKobo,
      category: 'transfer',
      description: `Internal transfer from ${user.fullName}`,
      metadata: { isInternal: true, senderWalletId: debit.walletId.toString() },
      refs: {},
    });
    
    // Notify recipient
    await notificationService.notify(targetWallet.userId, {
      type: 'wallet',
      title: 'Transfer Received',
      body: `₦${(amountKobo / 100).toLocaleString()} received from ${user.fullName}.`,
    });
    
    return { ...debit, nombaStatus: 'success' };
  }

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
    // stuck in limbo. Also flip the original debit's own status so it
    // doesn't display as permanently 'submitted' even though it was
    // already resolved (found this happening for real: two rejected
    // transfers correctly auto-refunded here, but still showed 'submitted'
    // forever since only the async webhook path used to update this).
    await creditImmediate(userId, {
      amountKobo,
      category: 'refund',
      description: 'Withdrawal failed - refund',
      metadata: { originalTransactionId: debit._id.toString() },
      refs: {},
    });
    await transactionModel.collection().updateOne(
      { _id: debit._id },
      { $set: { 'metadata.nombaStatus': 'refunded', updatedAt: new Date() } },
    );
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
 * Shared by the webhook path and the ledger-reconciliation path below - both
 * end with the same credit + activity + notification once a dedicated
 * virtual account transfer is confirmed. Dedupes on nombaTransactionId when
 * one is available; the reconciliation path additionally guards against
 * crediting something the webhook already handled under a different id (see
 * reconcileVirtualAccountTransfers).
 */
async function creditVactTransferIfNew(wallet, { amountKobo, nombaTransactionId }) {
  if (nombaTransactionId) {
    const existing = await transactionModel.findByNombaTransactionId(nombaTransactionId);
    if (existing) return; // already credited - webhook retry or reconciliation re-run
  }

  const credit = await creditImmediate(wallet.userId, {
    amountKobo,
    category: 'wallet_funding',
    description: 'Wallet funding via bank transfer',
    metadata: {},
    refs: nombaTransactionId ? { nombaTransactionId } : {},
  });
  await activityService.record(wallet.userId, {
    type: 'wallet_funding',
    title: 'Wallet Funded',
    subtitle: `₦${(amountKobo / 100).toLocaleString()} credited`,
    iconKey: 'account_balance_wallet',
  });
  await notificationService.notify(wallet.userId, {
    type: 'wallet',
    title: 'Wallet Funded',
    body: `₦${(amountKobo / 100).toLocaleString()} has been credited to your wallet.`,
  });
  return credit;
}

/**
 * Central handler for all 6 Nomba webhook event types. Idempotent: relies
 * on transactionModel's pending-row lookups only mutating state once.
 */
async function handleNombaWebhook(eventType, rawData) {
  const data = nomba.parseWebhookData(rawData);
  switch (eventType) {
    case 'payment_success': {
      if (data.aliasAccountNumber || data.aliasAccountReference) {
        // Match by account number first (unambiguous - it's literally what
        // we store as virtualAccountNumber); accountRef as a fallback in
        // case Nomba ever omits the number on some payload variant.
        const wallet =
          (data.aliasAccountNumber &&
            (await walletModel.findByVirtualAccountNumber(data.aliasAccountNumber))) ||
          (data.aliasAccountReference &&
            (await walletModel.findByVirtualAccountRef(data.aliasAccountReference)));
        if (!wallet || !data.amountKobo) return; // unknown virtual account, or unparseable amount

        return creditVactTransferIfNew(wallet, {
          amountKobo: data.amountKobo,
          nombaTransactionId: data.transactionId,
        });
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
      if (!existing) return;
      return refundFailedPayoutIfNew(existing);
    }
    default:
      return;
  }
}

/**
 * Shared by the payout_failed/payout_refund webhook case and the ledger-
 * reconciliation path below - a failed/reversed outbound transfer (patient
 * withdrawal or partner/admin earnings withdrawal, all share this same
 * withdrawToBank path) must be refunded back to the wallet it was debited
 * from. Guards against double-refunding the same withdrawal twice.
 */
async function refundFailedPayoutIfNew(transaction) {
  if (transaction.metadata?.nombaStatus === 'refunded') return; // already refunded

  await creditImmediate(transaction.userId, {
    amountKobo: transaction.amount,
    category: 'refund',
    description: 'Withdrawal failed - refund',
    metadata: { originalTransactionId: transaction._id.toString() },
    refs: {},
  });
  await transactionModel.collection().updateOne(
    { _id: transaction._id },
    { $set: { 'metadata.nombaStatus': 'refunded', updatedAt: new Date() } },
  );
  await notificationService.notify(transaction.userId, {
    type: 'wallet',
    title: 'Withdrawal Failed',
    body: `Your withdrawal of ₦${(transaction.amount / 100).toLocaleString()} failed and has been refunded.`,
  });
}

/**
 * Safety net for outbound bank transfers (withdrawals - shared by patient,
 * partner, and admin wallets): if a payout_success/payout_failed/
 * payout_refund webhook never arrives, a transaction can sit indefinitely
 * with metadata.nombaStatus stuck at 'submitted'/'pending', and worse - if
 * the transfer actually failed/reversed at Nomba but the refund webhook was
 * missed, the user stays debited for money that was never actually sent.
 * Scans Nomba's ledger directly by merchantTxRef and reconciles either way.
 */
async function reconcilePendingPayouts() {
  const stale = await transactionModel.findStaleSubmittedPayouts({
    olderThanMs: 5 * 60 * 1000, // give the webhook 5 minutes before we check
    newerThanMs: 3 * 24 * 60 * 60 * 1000, // beyond 3 days, Nomba's own record is unlikely to help either
  });
  if (!stale.length) return;

  const now = new Date();
  const dateFrom = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
  const dateTo = now.toISOString().slice(0, 19);
  const entries = await nomba.listAccountTransactions({ dateFrom, dateTo });
  const byMerchantTxRef = new Map(entries.map((t) => [t.merchantTxRef, t]));

  for (const transaction of stale) {
    try {
      const entry = byMerchantTxRef.get(transaction.nombaTransferRef);
      if (!entry) continue; // Nomba has no record of it yet - still genuinely in flight

      if (entry.status === 'SUCCESS') {
        await transactionModel.collection().updateOne(
          { _id: transaction._id },
          { $set: { 'metadata.nombaStatus': 'success', updatedAt: new Date() } },
        );
      } else if (entry.status === 'REFUND') {
        // Nomba's own docs: a failed transfer auto-refunds on their side and
        // is reported back with this status - mirrors the payout_refund
        // webhook case exactly.
        await refundFailedPayoutIfNew(transaction);
      }
      // Any other status (NEW, PENDING_BILLING, ...) - still in flight,
      // leave it for the next sweep rather than guessing.
    } catch (error) {
      console.error(`Payout reconciliation failed for ${transaction.nombaTransferRef}:`, error.message);
    }
  }
}

/**
 * Safety net for dedicated-virtual-account transfers: unlike checkout
 * orders (removed), a vact_transfer has no pending row on our side to check
 * up on, so a webhook that's missing entirely (not just late) is otherwise
 * invisible - confirmed happening for real, where transfers landed on
 * Nomba's side but never reached our webhook handler. Scans Nomba's own
 * account ledger instead and credits anything that landed on one of our
 * virtual accounts but never made it into our transactions collection.
 */
async function reconcileVirtualAccountTransfers() {
  const now = new Date();
  const dateFrom = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
  const dateTo = now.toISOString().slice(0, 19);

  const entries = await nomba.listAccountTransactions({ dateFrom, dateTo });
  const credits = entries.filter((t) => t.type === 'vact_transfer' && t.entryType === 'CREDIT');

  for (const entry of credits) {
    try {
      const wallet = await walletModel.findByVirtualAccountNumber(entry.recipientAccountNumber);
      if (!wallet) continue; // not one of our accounts (this Nomba merchant is shared with others)

      const amountKobo = Math.round(parseFloat(entry.amount) * 100);
      const ledgerTransactionId = entry.paymentVendorReference || entry.id;

      const alreadyByRef = await transactionModel.findByNombaTransactionId(ledgerTransactionId);
      if (alreadyByRef) continue;

      // Wide window is deliberate: a manual/untraceable credit (e.g. an
      // admin-run recovery script with no Nomba reference to exact-match
      // against) can legitimately lag the real transfer by tens of minutes,
      // not seconds. Confirmed happening for real - a 37-minute-late manual
      // credit fell outside an earlier 10-minute window and this sweep
      // double-credited the same real transfer on top of it. Double-
      // crediting real money is a far worse failure mode than occasionally
      // skipping a same-amount transfer from the same account within a day
      // of another one, so this errs hard toward the former.
      const alreadyByWindow = await transactionModel.findWalletFundingNear(
        wallet._id,
        amountKobo,
        new Date(entry.timeCreated),
        24 * 60 * 60 * 1000,
      );
      if (alreadyByWindow) continue;

      await creditVactTransferIfNew(wallet, { amountKobo, nombaTransactionId: ledgerTransactionId });
    } catch (error) {
      console.error(`Virtual account transfer reconciliation failed for ${entry.id}:`, error.message);
    }
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
  reconcileVirtualAccountTransfers,
  reconcilePendingPayouts,
};
