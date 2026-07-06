const { getDb } = require('../db');

const COLLECTION = 'plans';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({
  name,
  price,
  interval,
  type,
  features,
  excludedFeatures,
  transactionSplit,
  maxVaultFolders,
  maxVaultFiles,
}) {
  const now = new Date();
  const doc = {
    name,
    price: Number(price),
    interval: interval || 'monthly',
    type: type || 'Partner',
    features: features || [],
    excludedFeatures: excludedFeatures || [],
    transactionSplit: Number(transactionSplit || 0),
    // Vault limits only apply to Individual (patient) plans - null means
    // unlimited. Unset on Partner plans, who don't use the patient vault.
    maxVaultFolders: maxVaultFolders === undefined || maxVaultFolders === null ? null : Number(maxVaultFolders),
    maxVaultFiles: maxVaultFiles === undefined || maxVaultFiles === null ? null : Number(maxVaultFiles),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findActive(type) {
  const query = { status: 'active' };
  if (type) query.type = type;
  return collection().find(query).toArray();
}

function findAll() {
  return collection().find().toArray();
}

function update(planId, updates) {
  return collection().updateOne(
    { _id: planId },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

module.exports = {
  COLLECTION,
  collection,
  create,
  findActive,
  findAll,
  update,
};
