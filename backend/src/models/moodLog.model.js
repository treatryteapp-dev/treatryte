const { getDb } = require('../db');

const COLLECTION = 'mood_logs';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ userId, doseLogId, mood, note, partnerId }) {
  const doc = {
    userId,
    doseLogId,
    mood,
    note: note || null,
    partnerId: partnerId || null,
    createdAt: new Date(),
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByPartnerId(partnerId) {
  return collection().find({ partnerId }).sort({ createdAt: -1 }).toArray();
}

module.exports = { COLLECTION, collection, create, findByPartnerId };
