const { getDb } = require('../db');

const COLLECTION = 'dose_logs';

function collection() {
  return getDb().collection(COLLECTION);
}

function findForMedicationOnDate(medicationId, scheduledFor) {
  return collection().findOne({ medicationId, scheduledFor });
}

async function create({ userId, medicationId, scheduledFor }) {
  const doc = {
    userId,
    medicationId,
    scheduledFor,
    status: 'pending',
    takenAt: null,
    createdAt: new Date(),
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findById(userId, doseLogId) {
  return collection().findOne({ _id: doseLogId, userId });
}

function markTaken(doseLogId) {
  return collection().updateOne(
    { _id: doseLogId },
    { $set: { status: 'taken', takenAt: new Date() } },
  );
}

function findForDay(userId, dayStart, dayEnd) {
  return collection()
    .find({ userId, scheduledFor: { $gte: dayStart, $lt: dayEnd } })
    .sort({ scheduledFor: 1 })
    .toArray();
}

module.exports = { COLLECTION, collection, findForMedicationOnDate, create, findById, markTaken, findForDay };
