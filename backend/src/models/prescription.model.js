const { getDb } = require('../db');

const COLLECTION = 'prescriptions';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ labId, patientId, medicineName, dosage, duration, notes }) {
  const now = new Date();
  const doc = {
    labId,
    patientId,
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

function findByLabIdAndPatientId(labId, patientId) {
  return collection().find({ labId, patientId }).sort({ createdAt: -1 }).toArray();
}

function findByPatientId(patientId) {
  return collection().find({ patientId }).sort({ createdAt: -1 }).toArray();
}

module.exports = {
  COLLECTION,
  collection,
  create,
  findByLabIdAndPatientId,
  findByPatientId,
};
