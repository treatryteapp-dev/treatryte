const { getDb } = require('../db');

const COLLECTION = 'medical_records';

function collection() {
  return getDb().collection(COLLECTION);
}

// A general visit/encounter note (the "Issue Medical Record" flow) - kept
// separate from prescriptions (medications), since they're distinct
// concepts already surfaced as two different actions in the app.
async function create({ labId, patientId, visitType, notes }) {
  const now = new Date();
  const doc = {
    labId,
    patientId,
    visitType,
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

module.exports = {
  COLLECTION,
  collection,
  create,
  findByLabIdAndPatientId,
};
