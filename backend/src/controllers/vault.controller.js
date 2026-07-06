const { z } = require('zod');
const { ObjectId } = require('mongodb');

const vaultService = require('../services/vault.service');
const labModel = require('../models/lab.model');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid id', 'INVALID_ID');
  }
  return new ObjectId(id);
}

const createFolderSchema = z.object({
  name: z.string().min(1),
});

const createFolder = asyncHandler(async (req, res) => {
  const folder = await vaultService.createFolder(req.userId, req.body.name);
  res.status(201).json({ folder });
});

const listFolders = asyncHandler(async (req, res) => {
  const folders = await vaultService.listFolders(req.userId);
  res.json({ folders });
});

const presignSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  category: z.string().min(1),
  folderId: z.string().optional(),
});

const presign = asyncHandler(async (req, res) => {
  let labId;
  // Never trust a client-supplied labId - resolve the caller's own lab
  // server-side so a verification doc can only ever attach to the
  // uploader's own partner profile.
  if (req.body.category === 'partner_verification') {
    const lab = await labModel.findByUserId(req.userId);
    if (!lab) {
      throw new ApiError(404, 'No partner profile found for this account', 'LAB_NOT_FOUND');
    }
    labId = lab._id;
  }

  const folderId = req.body.folderId ? parseObjectId(req.body.folderId) : undefined;
  const result = await vaultService.presignUpload(req.userId, { ...req.body, labId, folderId });
  res.status(201).json(result);
});

const confirm = asyncHandler(async (req, res) => {
  const file = await vaultService.confirmUpload(req.userId, parseObjectId(req.params.fileId));
  res.json({ file });
});

const getFile = asyncHandler(async (req, res) => {
  const file = await vaultService.getFile(req.userId, parseObjectId(req.params.fileId));
  res.json({ file });
});

const listFiles = asyncHandler(async (req, res) => {
  const folderId = req.query.folderId ? parseObjectId(req.query.folderId) : undefined;
  const files = await vaultService.listFiles(req.userId, req.query.category, folderId);
  res.json({ files });
});

const categories = asyncHandler(async (req, res) => {
  const results = await vaultService.getCategories(req.userId);
  res.json({ categories: results.map((c) => ({ category: c._id, count: c.count })) });
});

const stats = asyncHandler(async (req, res) => {
  const result = await vaultService.getStats(req.userId);
  res.json(result);
});

module.exports = {
  createFolderSchema,
  createFolder,
  listFolders,
  presignSchema,
  presign,
  confirm,
  getFile,
  listFiles,
  categories,
  stats,
};
