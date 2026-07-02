const { getDb } = require('../db');

const COLLECTION = 'refresh_tokens';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function collection() {
  return getDb().collection(COLLECTION);
}

async function create(userId, tokenHash) {
  const now = new Date();
  const doc = {
    userId,
    tokenHash,
    expiresAt: new Date(now.getTime() + TTL_MS),
    revokedAt: null,
    createdAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findValidByHash(tokenHash) {
  return collection().findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

function revokeById(id) {
  return collection().updateOne({ _id: id }, { $set: { revokedAt: new Date() } });
}

function revokeAllForUser(userId) {
  return collection().updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}

module.exports = { COLLECTION, collection, create, findValidByHash, revokeById, revokeAllForUser };
