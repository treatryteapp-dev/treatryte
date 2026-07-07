const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const COLLECTION = 'connections';

function collection() {
  return getDb().collection(COLLECTION);
}

function idVariant(id) {
  if (!id) return id;
  if (typeof id === 'string' && ObjectId.isValid(id)) {
    return { $in: [id, new ObjectId(id)] };
  }
  if (id instanceof ObjectId) {
    return { $in: [id, id.toString()] };
  }
  return id;
}

// A partner<->patient sharing relationship. Pending until the patient
// explicitly accepts, at which point they choose exactly what to share
// (shareAll, or a specific list of their own vault folders) - a partner
// never sees a patient's vault contents just by inviting them.
async function findOrCreatePending(labId, patientUserId) {
  const existing = await collection().findOne({ labId: idVariant(labId), patientUserId: idVariant(patientUserId) });
  if (existing) return existing;

  const now = new Date();
  const doc = {
    labId,
    patientUserId,
    status: 'pending',
    shareAll: false,
    sharedFolderIds: [],
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByLabAndPatient(labId, patientUserId) {
  return collection().findOne({ labId: idVariant(labId), patientUserId: idVariant(patientUserId) });
}

function findByPatient(patientUserId) {
  return collection().find({ patientUserId: idVariant(patientUserId) }).sort({ createdAt: -1 }).toArray();
}

function findById(patientUserId, connectionId) {
  return collection().findOne({ _id: idVariant(connectionId), patientUserId: idVariant(patientUserId) });
}

function accept(connectionId, { shareAll, sharedFolderIds }) {
  return collection().updateOne(
    { _id: connectionId },
    { $set: { status: 'accepted', shareAll: !!shareAll, sharedFolderIds: sharedFolderIds || [], updatedAt: new Date() } },
  );
}

function decline(connectionId) {
  return collection().updateOne(
    { _id: connectionId },
    { $set: { status: 'declined', updatedAt: new Date() } },
  );
}

module.exports = {
  COLLECTION,
  collection,
  findOrCreatePending,
  findByLabAndPatient,
  findByPatient,
  findById,
  accept,
  decline,
};
