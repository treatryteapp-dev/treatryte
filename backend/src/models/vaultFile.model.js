const { getDb } = require('../db');

const COLLECTION = 'vault_files';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ userId, category, fileName, mimeType, sizeBytes, s3Key, labId }) {
  const now = new Date();
  const doc = {
    userId,
    category,
    fileName,
    mimeType,
    sizeBytes,
    s3Key,
    labId: labId || null,
    status: 'pending_upload',
    uploadedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByLabId(labId, category) {
  const query = { labId, status: 'uploaded' };
  if (category) query.category = category;
  return collection().find(query).sort({ createdAt: -1 }).toArray();
}

function findByLabIdAndUserId(labId, userId) {
  return collection()
    .find({ labId, userId, status: 'uploaded' })
    .sort({ createdAt: -1 })
    .toArray();
}

function findById(userId, fileId) {
  return collection().findOne({ _id: fileId, userId });
}

function markUploaded(fileId) {
  return collection().updateOne(
    { _id: fileId },
    { $set: { status: 'uploaded', uploadedAt: new Date(), updatedAt: new Date() } },
  );
}

function list(userId, category) {
  const query = { userId, status: 'uploaded' };
  if (category) query.category = category;
  return collection().find(query).sort({ createdAt: -1 }).toArray();
}

function categoryCounts(userId) {
  return collection()
    .aggregate([
      { $match: { userId, status: 'uploaded' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ])
    .toArray();
}

function storageStats(userId) {
  return collection()
    .aggregate([
      { $match: { userId, status: 'uploaded' } },
      { $group: { _id: null, usedBytes: { $sum: '$sizeBytes' }, fileCount: { $sum: 1 } } },
    ])
    .toArray();
}

module.exports = {
  COLLECTION,
  collection,
  create,
  findById,
  findByLabId,
  findByLabIdAndUserId,
  markUploaded,
  list,
  categoryCounts,
  storageStats,
};
