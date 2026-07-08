const { getDb, getClient } = require('../db');

const COLLECTION = 'transactions';

function collection() {
  return getDb().collection(COLLECTION);
}

function walletCollection() {
  return getDb().collection('wallets');
}

function list(userId, { page = 1, limit = 20, category } = {}) {
  const query = { userId };
  if (category) query.category = category;

  return collection()
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
}

function findByNombaOrderReference(nombaOrderReference) {
  return collection().findOne({ nombaOrderReference });
}

function findByNombaTransferRef(nombaTransferRef) {
  return collection().findOne({ nombaTransferRef });
}

// Dedup key for virtual-account transfers, which (unlike checkout orders)
// have no pre-existing pending row to flip to 'success' - idempotency has
// to be keyed off Nomba's own transaction id directly instead.
function findByNombaTransactionId(nombaTransactionId) {
  return collection().findOne({ nombaTransactionId });
}

/**
 * Secondary dedup guard for ledger-based reconciliation (see
 * wallet.service.js reconcileVirtualAccountTransfers): a webhook-sourced
 * credit for the same transfer may already exist under a different id than
 * the one the ledger export uses, so an exact nombaTransactionId match isn't
 * enough on its own - this catches "already credited, just under another
 * reference" by wallet + amount + a tight time window instead. Restricted to
 * 'success' rows only - a pending/abandoned row of the same amount is not
 * evidence of an existing credit.
 */
function findWalletFundingNear(walletId, amountKobo, aroundTime, windowMs) {
  return collection().findOne({
    walletId,
    category: 'wallet_funding',
    status: 'success',
    amount: amountKobo,
    createdAt: {
      $gte: new Date(aroundTime.getTime() - windowMs),
      $lte: new Date(aroundTime.getTime() + windowMs),
    },
  });
}

/**
 * Wallet-funding rows still 'pending' outside the normal webhook-delivery
 * window - candidates for reconciling directly against Nomba's API instead
 * of waiting on a webhook that may have been missed or rejected. Bounded on
 * the old end too: Nomba's own webhook retries and this record's usefulness
 * both taper off after a few days, so there's no point checking forever.
 */
function findStalePendingFundings({ olderThanMs, newerThanMs }) {
  const now = Date.now();
  return collection()
    .find({
      category: 'wallet_funding',
      status: 'pending',
      nombaOrderReference: { $exists: true },
      createdAt: { $lt: new Date(now - olderThanMs), $gt: new Date(now - newerThanMs) },
    })
    .toArray();
}

/**
 * Inserts a transaction row without touching the wallet balance.
 * Used for funding orders that only become real money once Nomba confirms
 * payment via webhook.
 */
async function recordPending({ userId, walletId, type, category, amount, description, metadata, refs }) {
  const now = new Date();
  const doc = {
    userId,
    walletId,
    type,
    category,
    amount,
    balanceAfter: null,
    status: 'pending',
    description,
    metadata: metadata || {},
    ...refs,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Atomically applies a balance delta and inserts the corresponding ledger
 * row in the same transaction, so `wallets.balance` and the `transactions`
 * collection can never drift.
 */
async function applyImmediate({ userId, walletId, type, category, amount, description, metadata, refs }) {
  const client = getClient();
  const session = client.startSession();
  const delta = type === 'credit' ? amount : -amount;

  try {
    let transactionDoc;
    await session.withTransaction(async () => {
      const wallet = await walletCollection().findOneAndUpdate(
        { _id: walletId },
        { $inc: { balance: delta }, $set: { updatedAt: new Date() } },
        { returnDocument: 'after', session },
      );

      const now = new Date();
      transactionDoc = {
        userId,
        walletId,
        type,
        category,
        amount,
        balanceAfter: wallet.balance,
        status: 'success',
        description,
        metadata: metadata || {},
        ...refs,
        createdAt: now,
        updatedAt: now,
      };
      const result = await collection().insertOne(transactionDoc, { session });
      transactionDoc._id = result.insertedId;
    });
    return transactionDoc;
  } finally {
    await session.endSession();
  }
}

/**
 * Marks a previously-pending transaction as settled and (for credits only)
 * applies the balance delta atomically. Idempotent: if a transaction with
 * the same nombaTransactionId already exists (unique index), the duplicate
 * insert/update is a no-op.
 */
async function finalizePendingCredit(transactionId, nombaTransactionId) {
  const client = getClient();
  const session = client.startSession();

  try {
    let result = null;
    await session.withTransaction(async () => {
      const pending = await collection().findOne(
        { _id: transactionId, status: 'pending' },
        { session },
      );
      if (!pending) return; // already finalized or unknown - idempotent no-op

      const wallet = await walletCollection().findOneAndUpdate(
        { _id: pending.walletId },
        { $inc: { balance: pending.amount }, $set: { updatedAt: new Date() } },
        { returnDocument: 'after', session },
      );

      await collection().updateOne(
        { _id: pending._id },
        {
          $set: {
            status: 'success',
            balanceAfter: wallet.balance,
            nombaTransactionId,
            updatedAt: new Date(),
          },
        },
        { session },
      );
      result = { ...pending, status: 'success', balanceAfter: wallet.balance };
    });
    return result;
  } finally {
    await session.endSession();
  }
}

async function markFailed(transactionId) {
  await collection().updateOne(
    { _id: transactionId, status: 'pending' },
    { $set: { status: 'failed', updatedAt: new Date() } },
  );
}

module.exports = {
  COLLECTION,
  collection,
  list,
  findByNombaOrderReference,
  findByNombaTransferRef,
  findByNombaTransactionId,
  findWalletFundingNear,
  findStalePendingFundings,
  recordPending,
  applyImmediate,
  finalizePendingCredit,
  markFailed,
};
