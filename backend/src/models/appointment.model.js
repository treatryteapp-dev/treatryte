const { getDb } = require('../db');

const COLLECTION = 'appointments';

function collection() {
  return getDb().collection(COLLECTION);
}

function countBooked(labId, scheduledDate, scheduledTimeSlot) {
  return collection().countDocuments({
    labId,
    scheduledDate,
    scheduledTimeSlot,
    status: { $in: ['pending_payment', 'confirmed'] },
  });
}

async function create({ userId, labId, testId, scheduledDate, scheduledTimeSlot, subtotal, serviceFee, total }) {
  const now = new Date();
  const doc = {
    userId,
    labId,
    testId,
    scheduledDate,
    scheduledTimeSlot,
    status: 'pending_payment',
    subtotal,
    serviceFee,
    total,
    transactionId: null,
    settlementId: null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findById(userId, appointmentId) {
  return collection().findOne({ _id: appointmentId, userId });
}

function markConfirmed(appointmentId, transactionId) {
  return collection().updateOne(
    { _id: appointmentId },
    { $set: { status: 'confirmed', transactionId, updatedAt: new Date() } },
  );
}

function list(userId) {
  return collection().find({ userId }).sort({ createdAt: -1 }).toArray();
}

function listByLabId(labId) {
  return collection().find({ labId }).sort({ createdAt: -1 }).toArray();
}

function updateStatus(appointmentId, status) {
  return collection().updateOne(
    { _id: appointmentId },
    { $set: { status, updatedAt: new Date() } }
  );
}

function updateSchedule(appointmentId, { scheduledDate, scheduledTimeSlot }) {
  return collection().updateOne(
    { _id: appointmentId },
    { $set: { scheduledDate, scheduledTimeSlot, updatedAt: new Date() } }
  );
}

/**
 * Distinct patients seen at a lab, derived from appointment history (there
 * is no first-class provider-patient linkage collection) - most recent
 * appointment first.
 */
function listDistinctPatientsByLabId(labId) {
  return collection()
    .aggregate([
      { $match: { labId } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$userId', lastVisit: { $first: '$createdAt' } } },
      { $sort: { lastVisit: -1 } },
    ])
    .toArray();
}

function listUnsettledConfirmed() {
  return collection().find({ status: 'confirmed', settlementId: null }).toArray();
}

function markSettled(appointmentIds, settlementId) {
  return collection().updateMany(
    { _id: { $in: appointmentIds } },
    { $set: { settlementId, updatedAt: new Date() } }
  );
}

module.exports = {
  COLLECTION,
  collection,
  countBooked,
  create,
  findById,
  markConfirmed,
  list,
  listByLabId,
  updateStatus,
  updateSchedule,
  listDistinctPatientsByLabId,
  listUnsettledConfirmed,
  markSettled,
};
