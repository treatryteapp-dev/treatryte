const { getDb } = require('../db');

const COLLECTION = 'tests';

function collection() {
  return getDb().collection(COLLECTION);
}

function findByLabId(labId) {
  return collection().find({ labId }).toArray();
}

function findTrending() {
  return collection().find({ isTrending: true }).toArray();
}

function findById(testId) {
  return collection().findOne({ _id: testId });
}

async function create({ labId, name, price, category, isTrending }) {
  const now = new Date();
  const doc = {
    labId,
    name,
    price,
    category,
    isTrending: isTrending || false,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function update(testId, updates) {
  return collection().updateOne(
    { _id: testId },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

function deleteById(testId) {
  return collection().deleteOne({ _id: testId });
}

module.exports = {
  COLLECTION,
  collection,
  findByLabId,
  findTrending,
  findById,
  create,
  update,
  deleteById,
};
