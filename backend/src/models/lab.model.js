const { getDb } = require('../db');

const COLLECTION = 'labs';

function collection() {
  return getDb().collection(COLLECTION);
}

function findFeatured() {
  return collection().find({ isFeatured: true, status: 'approved' }).toArray();
}

function findApproved() {
  return collection().find({ status: 'approved' }).toArray();
}

function findById(labId) {
  return collection().findOne({ _id: labId });
}

function search(query) {
  return collection()
    .find({ name: { $regex: query, $options: 'i' }, status: 'approved' })
    .toArray();
}

async function create({ userId, name, licenseNumber, address, state, services, bankDetails }) {
  const now = new Date();
  const doc = {
    userId,
    name,
    licenseNumber,
    address,
    state: state || '',
    services: services || [],
    bankDetails: bankDetails || {},
    isFeatured: false,
    rating: 4.8,
    status: 'pending',
    rejectionReason: null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByUserId(userId) {
  return collection().findOne({ userId });
}

function update(labId, updates) {
  return collection().updateOne(
    { _id: labId },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

module.exports = {
  COLLECTION,
  collection,
  findFeatured,
  findApproved,
  findById,
  search,
  create,
  findByUserId,
  update,
};
