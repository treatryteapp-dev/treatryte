const crypto = require('crypto');
const { PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getS3SignedUrl } = require('@aws-sdk/s3-request-presigner');

const env = require('../config/env');
const { getS3Client } = require('../aws');
const { signVaultUrl } = require('../cloudfrontSign');
const vaultFileModel = require('../models/vaultFile.model');
const vaultFolderModel = require('../models/vaultFolder.model');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const labModel = require('../models/lab.model');
const connectionModel = require('../models/connection.model');
const activityService = require('./activity.service');
const { ApiError } = require('../middleware/errorHandler');

const PRESIGN_TTL_SECONDS = 300;
// Baseline for a patient with no plan assigned yet, matching the Free
// Tier's advertised "Max 5 medical records across 2 folders".
const DEFAULT_MAX_VAULT_FOLDERS = 2;
const DEFAULT_MAX_VAULT_FILES = 5;

async function getVaultLimits(userId) {
  const user = await userModel.findById(userId);
  const plan = user?.planId ? await planModel.collection().findOne({ _id: user.planId }) : null;
  return {
    maxVaultFolders: plan && 'maxVaultFolders' in plan ? plan.maxVaultFolders : DEFAULT_MAX_VAULT_FOLDERS,
    maxVaultFiles: plan && 'maxVaultFiles' in plan ? plan.maxVaultFiles : DEFAULT_MAX_VAULT_FILES,
  };
}

async function enrichFiles(files) {
  if (!files || files.length === 0) return [];
  const labIds = files.map((f) => f.labId).filter(Boolean);
  let labsById = new Map();
  if (labIds.length > 0) {
    const labs = await labModel.collection().find({ _id: { $in: labIds } }).toArray();
    labsById = new Map(labs.map((l) => [l._id.toString(), l]));
  }
  return files.map((file) => {
    let sourceName = 'Patient Uploaded';
    let sourceType = 'patient';
    if (file.labId && labsById.has(file.labId.toString())) {
      sourceName = labsById.get(file.labId.toString()).name;
      sourceType = 'partner';
    } else if (file.hospitalName || (file.source && file.source !== 'Patient Uploaded')) {
      sourceName = file.hospitalName || file.source;
      sourceType = 'imported_hospital';
    }
    return {
      ...file,
      url: signVaultUrl(file.s3Key),
      source: sourceName,
      uploadedBy: sourceName,
      sourceType,
    };
  });
}

async function createFolder(userId, name) {
  const limits = await getVaultLimits(userId);
  if (limits.maxVaultFolders !== null) {
    const count = await vaultFolderModel.countByUserId(userId);
    if (count >= limits.maxVaultFolders) {
      throw new ApiError(
        403,
        `Your plan allows up to ${limits.maxVaultFolders} folders. Upgrade your plan to add more.`,
        'FOLDER_LIMIT_REACHED',
      );
    }
  }
  return vaultFolderModel.create({ userId, name });
}

async function listFolders(userId) {
  const [folders, counts] = await Promise.all([
    vaultFolderModel.findByUserId(userId),
    vaultFileModel.folderCounts(userId),
  ]);
  const countsById = new Map(counts.map((c) => [c._id.toString(), c.count]));
  return folders.map((f) => ({ ...f, fileCount: countsById.get(f._id.toString()) || 0 }));
}

// [labId] means this is a partner-verification upload (registration/
// resubmission docs), which isn't part of a patient's own folder system and
// isn't subject to vault plan limits - those only gate a patient's personal
// records.
async function presignUpload(userId, { fileName, mimeType, sizeBytes, category, labId, folderId, source, hospitalName }) {
  if (!labId) {
    if (!folderId) {
      throw new ApiError(400, 'A folder is required to upload a document', 'FOLDER_REQUIRED');
    }
    const folder = await vaultFolderModel.findById(userId, folderId);
    if (!folder) {
      throw new ApiError(404, 'Folder not found', 'FOLDER_NOT_FOUND');
    }

    const limits = await getVaultLimits(userId);
    if (limits.maxVaultFiles !== null) {
      const [stats] = await vaultFileModel.storageStats(userId);
      if ((stats?.fileCount || 0) >= limits.maxVaultFiles) {
        throw new ApiError(
          403,
          `Your plan allows up to ${limits.maxVaultFiles} records. Upgrade your plan to add more.`,
          'FILE_LIMIT_REACHED',
        );
      }
    }
  }

  const s3Key = `vault/${userId.toString()}/${crypto.randomUUID()}-${fileName}`;

  const file = await vaultFileModel.create({ userId, category, fileName, mimeType, sizeBytes, s3Key, labId, folderId, source, hospitalName });

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
  let file = await vaultFileModel.findById(userId, fileId);
  if (!file) {
    const lab = await labModel.findByUserId(userId);
    if (lab) {
      file = await vaultFileModel.collection().findOne({ _id: fileId, status: 'uploaded' });
      if (file) {
        const connection = await connectionModel.findByLabAndPatient(lab._id, file.userId);
        if (
          connection?.status !== 'accepted' ||
          (!connection.shareAll && !connection.sharedFolderIds?.some((id) => id.toString() === file.folderId?.toString()))
        ) {
          file = null;
        }
      }
    }
  }
  if (!file || file.status !== 'uploaded') {
    throw new ApiError(404, 'File not found', 'FILE_NOT_FOUND');
  }
  const [enriched] = await enrichFiles([file]);
  return enriched;
}

async function listFiles(userId, category, folderId) {
  const files = await vaultFileModel.list(userId, category, folderId);
  return enrichFiles(files);
}

async function getCategories(userId) {
  return vaultFileModel.categoryCounts(userId);
}

async function getStats(userId) {
  const [[stats], limits, folderCount] = await Promise.all([
    vaultFileModel.storageStats(userId),
    getVaultLimits(userId),
    vaultFolderModel.countByUserId(userId),
  ]);
  return {
    usedBytes: stats?.usedBytes || 0,
    fileCount: stats?.fileCount || 0,
    folderCount,
    maxVaultFolders: limits.maxVaultFolders,
    maxVaultFiles: limits.maxVaultFiles,
  };
}

module.exports = {
  createFolder,
  listFolders,
  presignUpload,
  confirmUpload,
  getFile,
  listFiles,
  getCategories,
  getStats,
  enrichFiles,
};
