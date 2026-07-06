const { getDb } = require('../db');

const COLLECTION = 'vault_folders';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ userId, name }) {
  const now = new Date();
  const doc = { userId, name, createdAt: now, updatedAt: now };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByUserId(userId) {
  return collection().find({ userId }).sort({ createdAt: -1 }).toArray();
}

function findById(userId, folderId) {
  return collection().findOne({ _id: folderId, userId });
}

function countByUserId(userId) {
  return collection().countDocuments({ userId });
}

module.exports = {
  COLLECTION,
  collection,
  create,
  findByUserId,
  findById,
  countByUserId,
};
