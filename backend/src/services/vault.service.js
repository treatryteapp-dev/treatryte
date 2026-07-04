const crypto = require('crypto');
const { PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getS3SignedUrl } = require('@aws-sdk/s3-request-presigner');

const env = require('../config/env');
const { getS3Client } = require('../aws');
const { signVaultUrl } = require('../cloudfrontSign');
const vaultFileModel = require('../models/vaultFile.model');
const userModel = require('../models/user.model');
const activityService = require('./activity.service');
const { ApiError } = require('../middleware/errorHandler');

const PRESIGN_TTL_SECONDS = 300;

async function presignUpload(userId, { fileName, mimeType, sizeBytes, category, labId }) {
  const s3Key = `vault/${userId.toString()}/${crypto.randomUUID()}-${fileName}`;

  const file = await vaultFileModel.create({ userId, category, fileName, mimeType, sizeBytes, s3Key, labId });

  const uploadUrl = await getS3SignedUrl(
    getS3Client(),
    new PutObjectCommand({ Bucket: env.aws.s3Bucket, Key: s3Key, ContentType: mimeType }),
    { expiresIn: PRESIGN_TTL_SECONDS },
  );

  return { fileId: file._id, uploadUrl, s3Key };
}

async function confirmUpload(userId, fileId) {
  const file = await vaultFileModel.findById(userId, fileId);
  if (!file) {
    throw new ApiError(404, 'File not found', 'FILE_NOT_FOUND');
  }

  try {
    await getS3Client().send(new HeadObjectCommand({ Bucket: env.aws.s3Bucket, Key: file.s3Key }));
  } catch {
    throw new ApiError(422, 'File was not found in storage - upload may have failed', 'UPLOAD_NOT_FOUND');
  }

  const uploadedAt = new Date();
  await vaultFileModel.markUploaded(fileId);
  await activityService.record(userId, {
    type: 'lab_upload',
    title: 'Document Uploaded',
    subtitle: `${file.fileName} added to ${file.category}`,
    iconKey: 'science_outlined',
    refCollection: vaultFileModel.COLLECTION,
    refId: fileId,
  });

  return { ...file, status: 'uploaded', uploadedAt };
}

async function getFile(userId, fileId) {
  const file = await vaultFileModel.findById(userId, fileId);
  if (!file || file.status !== 'uploaded') {
    throw new ApiError(404, 'File not found', 'FILE_NOT_FOUND');
  }
  return { ...file, url: signVaultUrl(file.s3Key) };
}

async function listFiles(userId, category) {
  return vaultFileModel.list(userId, category);
}

async function getCategories(userId) {
  return vaultFileModel.categoryCounts(userId);
}

async function getStats(userId) {
  const [stats] = await vaultFileModel.storageStats(userId);
  return {
    usedBytes: stats?.usedBytes || 0,
    fileCount: stats?.fileCount || 0,
    quotaBytes: env.vaultQuotaBytes,
  };
}

async function setBiometricLock(userId, enabled) {
  await userModel.collection().updateOne({ _id: userId }, { $set: { biometricLockEnabled: enabled } });
  return { biometricLockEnabled: enabled };
}

module.exports = {
  presignUpload,
  confirmUpload,
  getFile,
  listFiles,
  getCategories,
  getStats,
  setBiometricLock,
};
