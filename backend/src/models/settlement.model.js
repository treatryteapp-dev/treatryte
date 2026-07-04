const { getDb } = require('../db');

const COLLECTION = 'settlements';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ labId, appointmentIds, grossAmountKobo, platformFeeKobo, netAmountKobo, bankSnapshot }) {
  const now = new Date();
  const doc = {
    labId,
    appointmentIds,
    grossAmountKobo,
    platformFeeKobo,
    netAmountKobo,
    bankSnapshot,
    status: 'processing',
    nombaTransferRef: null,
    createdAt: now,
    updatedAt: now,
    settledAt: null,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByNombaTransferRef(nombaTransferRef) {
  return collection().findOne({ nombaTransferRef });
}

function listHistory() {
  return collection().find({ status: { $in: ['pending', 'completed', 'failed'] } }).sort({ createdAt: -1 }).toArray();
}

module.exports = {
  COLLECTION,
  collection,
  create,
  findByNombaTransferRef,
  listHistory,
};
