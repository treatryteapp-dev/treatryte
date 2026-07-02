const { getDb } = require('../db');

const COLLECTION = 'wallets';

function collection() {
  return getDb().collection(COLLECTION);
}

async function createForUser(userId) {
  const now = new Date();
  const doc = {
    userId,
    balance: 0, // kobo
    currency: 'NGN',
    nombaSubAccountId: null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByUserId(userId) {
  return collection().findOne({ userId });
}

module.exports = { COLLECTION, collection, createForUser, findByUserId };
