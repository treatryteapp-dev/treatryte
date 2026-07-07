const { getDb } = require('../db');

const COLLECTION = 'prescriptions';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ labId, patientId, userId, medicineName, dosage, duration, notes }) {
  const now = new Date();
  const doc = {
    labId,
    patientId,
    userId: userId || null,
    medicineName,
    dosage,
    duration,
    notes: notes || '',
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByLabIdAndPatientId(labId, patientId, userId) {
  const conditions = [
    { patientId: patientId },
    { patientId: patientId?.toString() }
  ];
  if (userId) {
    conditions.push({ userId: userId }, { userId: userId?.toString() });
  }
  return collection().find({
    labId,
    $or: conditions
  }).sort({ createdAt: -1 }).toArray();
}

function findByPatientId(patientId, userId) {
  const conditions = [
    { patientId: patientId },
    { patientId: patientId?.toString() }
  ];
  if (userId) {
    conditions.push({ userId: userId }, { userId: userId?.toString() });
  }
  return collection().find({
    $or: conditions
  }).sort({ createdAt: -1 }).toArray();
}

module.exports = {
  COLLECTION,
  collection,
  create,
  findByLabIdAndPatientId,
  findByPatientId,
};
