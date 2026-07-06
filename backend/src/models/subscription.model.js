const { getDb } = require('../db');

const COLLECTION = 'subscriptions';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ userId, planId, amountKobo, interval, nombaOrderReference }) {
  const now = new Date();
  const doc = {
    userId,
    planId,
    status: 'pending_payment',
    nombaOrderReference,
    renewalMethod: 'manual',
    currentPeriodStart: null,
    currentPeriodEnd: null,
    amountKobo,
    interval,
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findActiveByUserId(userId) {
  return collection().findOne({ userId, status: { $in: ['active', 'past_due'] } });
}

function findByNombaOrderReference(nombaOrderReference) {
  return collection().findOne({ nombaOrderReference });
}

function addInterval(date, interval) {
  const next = new Date(date);
  if (interval === 'yearly') {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

async function activate(subscriptionId) {
  const now = new Date();
  const periodEnd = addInterval(now, (await collection().findOne({ _id: subscriptionId }))?.interval);
  await collection().updateOne(
    { _id: subscriptionId },
    {
      $set: {
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      },
    },
  );
  return collection().findOne({ _id: subscriptionId });
}

function markPastDue(subscriptionId) {
  return collection().updateOne(
    { _id: subscriptionId },
    { $set: { status: 'past_due', updatedAt: new Date() } },
  );
}

function cancel(subscriptionId) {
  return collection().updateOne(
    { _id: subscriptionId },
    { $set: { cancelAtPeriodEnd: true, updatedAt: new Date() } },
  );
}

// Unlike cancel() (which just stops renewal at period end), this ends the
// subscription right away - used when the account itself is being deleted.
function cancelImmediately(subscriptionId) {
  return collection().updateOne(
    { _id: subscriptionId },
    { $set: { status: 'canceled', cancelAtPeriodEnd: true, updatedAt: new Date() } },
  );
}

/**
 * Returns subscriptions whose currentPeriodEnd falls at or before
 * `windowEnd` - i.e. already expired, or entering the reminder window.
 */
function listDueForRenewal(windowEnd) {
  return collection()
    .find({ status: 'active', cancelAtPeriodEnd: false, currentPeriodEnd: { $lte: windowEnd } })
    .toArray();
}

module.exports = {
  COLLECTION,
  collection,
  create,
  findActiveByUserId,
  findByNombaOrderReference,
  activate,
  markPastDue,
  cancel,
  cancelImmediately,
  listDueForRenewal,
};
