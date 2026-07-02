const { getDb } = require('../db');

const COLLECTION = 'mood_logs';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ userId, doseLogId, mood, note }) {
  const doc = {
    userId,
    doseLogId,
    mood,
    note: note || null,
    createdAt: new Date(),
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

module.exports = { COLLECTION, collection, create };
