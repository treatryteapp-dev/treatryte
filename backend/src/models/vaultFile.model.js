const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const COLLECTION = 'vault_files';

function collection() {
  return getDb().collection(COLLECTION);
}

function idVariant(id) {
  if (!id) return id;
  if (typeof id === 'string' && ObjectId.isValid(id)) {
    return { $in: [id, new ObjectId(id)] };
  }
  if (id instanceof ObjectId) {
    return { $in: [id, id.toString()] };
  }
  return id;
}

async function create({ userId, category, fileName, mimeType, sizeBytes, s3Key, labId, folderId, source, hospitalName }) {
  const now = new Date();
  const doc = {
    userId,
    category,
    folderId: folderId || null,
    fileName,
    mimeType,
    sizeBytes,
    s3Key,
    labId: labId || null,
    source: source || (labId ? null : 'Patient Uploaded'),
    hospitalName: hospitalName || null,
    status: 'pending_upload',
    uploadedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByLabId(labId, category) {
  // Include pending_upload so admin can see docs that were attempted
  // but not yet confirmed (e.g. an upload that failed mid-way).
  const query = { labId: idVariant(labId), status: { $in: ['uploaded', 'pending_upload'] } };
  if (category) query.category = category;
  return collection().find(query).sort({ createdAt: -1 }).toArray();
}

function findByLabIdAndUserId(labId, userId) {
  return collection()
    .find({ labId: idVariant(labId), userId: idVariant(userId), status: 'uploaded' })
    .sort({ createdAt: -1 })
    .toArray();
}

function findById(userId, fileId) {
  return collection().findOne({ _id: idVariant(fileId), userId: idVariant(userId) });
}

function markUploaded(fileId) {
  return collection().updateOne(
    { _id: idVariant(fileId) },
    { $set: { status: 'uploaded', uploadedAt: new Date(), updatedAt: new Date() } },
  );
}

function list(userId, category, folderId) {
  const query = { userId: idVariant(userId), status: 'uploaded' };
  if (category) query.category = category;
  if (folderId) query.folderId = idVariant(folderId);
  return collection().find(query).sort({ createdAt: -1 }).toArray();
}

// A patient's whole vault (all folders) or a specific subset of folders -
// used when a partner has been granted sharing access, since that access
// is granted per-folder (or "all folders"), not per-file.
function findByUserId(userId) {
  return collection().find({ userId: idVariant(userId), status: 'uploaded' }).sort({ createdAt: -1 }).toArray();
}

function findByUserIdAndFolderIds(userId, folderIds) {
  const ids = (folderIds || []).flatMap((id) =>
    typeof id === 'string' && ObjectId.isValid(id)
      ? [id, new ObjectId(id)]
      : id instanceof ObjectId
      ? [id, id.toString()]
      : [id],
  );
  return collection()
    .find({ userId: idVariant(userId), folderId: { $in: ids }, status: 'uploaded' })
    .sort({ createdAt: -1 })
    .toArray();
}

function categoryCounts(userId) {
  return collection()
    .aggregate([
      { $match: { userId: idVariant(userId), status: 'uploaded' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ])
    .toArray();
}

function folderCounts(userId) {
  return collection()
    .aggregate([
      { $match: { userId: idVariant(userId), status: 'uploaded', folderId: { $ne: null } } },
      { $group: { _id: '$folderId', count: { $sum: 1 } } },
    ])
    .toArray();
}

function storageStats(userId) {
  return collection()
    .aggregate([
      { $match: { userId: idVariant(userId), status: 'uploaded' } },
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
  findByUserId,
  findByUserIdAndFolderIds,
  markUploaded,
  list,
  categoryCounts,
  folderCounts,
  storageStats,
};
