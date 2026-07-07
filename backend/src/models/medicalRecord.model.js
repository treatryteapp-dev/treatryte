const { getDb } = require('../db');

const COLLECTION = 'medical_records';

function collection() {
  return getDb().collection(COLLECTION);
}

// A general visit/encounter note (the "Issue Medical Record" flow) - kept
// separate from prescriptions (medications), since they're distinct
// concepts already surfaced as two different actions in the app.
async function create({ labId, patientId, userId, visitType, notes, fileUrl, fileName, fileId }) {
  const now = new Date();
  const doc = {
    labId,
    patientId,
    userId: userId || null,
    visitType,
    notes: notes || '',
    fileUrl: fileUrl || null,
    fileName: fileName || null,
    fileId: fileId || null,
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

module.exports = {
  COLLECTION,
  collection,
  create,
  findByLabIdAndPatientId,
};
