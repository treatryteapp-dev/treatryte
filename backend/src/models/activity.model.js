const { getDb } = require('../db');

const COLLECTION = 'activities';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ userId, type, title, subtitle, iconKey, refCollection, refId }) {
  const doc = {
    userId,
    type,
    title,
    subtitle,
    iconKey,
    refCollection: refCollection || null,
    refId: refId || null,
    createdAt: new Date(),
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function listRecent(userId, limit = 5) {
  return collection().find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray();
}

module.exports = { COLLECTION, collection, create, listRecent };
