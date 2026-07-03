const { getDb } = require('../db');

const COLLECTION = 'plans';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ name, price, interval, type, features, excludedFeatures, nombaPlanId, transactionSplit }) {
  const now = new Date();
  const doc = {
    name,
    price: Number(price),
    interval: interval || 'monthly',
    type: type || 'Partner',
    features: features || [],
    excludedFeatures: excludedFeatures || [],
    nombaPlanId: nombaPlanId || '',
    transactionSplit: Number(transactionSplit || 0),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findActive() {
  return collection().find({ status: 'active' }).toArray();
}

function findAll() {
  return collection().find().toArray();
}

module.exports = {
  COLLECTION,
  collection,
  create,
  findActive,
  findAll,
};
