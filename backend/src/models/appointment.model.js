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

// [items] is a snapshot of the tests selected at booking time
// ({testId, name, price}) - since a partner can edit or delete a test later,
// the appointment must keep its own copy rather than re-joining testIds
// against the live tests collection. Wallet payment is synchronous, so the
// appointment is only ever inserted once payment has already succeeded -
// callers pass status: 'confirmed' and a real transactionId, not a
// placeholder "pending" record to be confirmed later.
async function create({
  userId,
  labId,
  items,
  scheduledDate,
  scheduledTimeSlot,
  subtotal,
  serviceFee,
  total,
  status,
  transactionId,
}) {
  const now = new Date();
  const doc = {
    userId,
    labId,
    testIds: items.map((item) => item.testId),
    items,
    scheduledDate,
    scheduledTimeSlot,
    status,
    subtotal,
    serviceFee,
    total,
    transactionId,
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
  list,
  listByLabId,
  updateStatus,
  updateSchedule,
  listDistinctPatientsByLabId,
  listUnsettledConfirmed,
  markSettled,
};
