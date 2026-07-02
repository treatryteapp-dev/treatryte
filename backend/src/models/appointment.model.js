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

module.exports = { COLLECTION, collection, countBooked, create, findById, markConfirmed, list };
