const { z } = require('zod');
const { ObjectId } = require('mongodb');

const connectionModel = require('../models/connection.model');
const labModel = require('../models/lab.model');
const vaultFolderModel = require('../models/vaultFolder.model');
const patientModel = require('../models/patient.model');
const medicalRecordModel = require('../models/medicalRecord.model');
const prescriptionModel = require('../models/prescription.model');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid id', 'INVALID_ID');
  }
  return new ObjectId(id);
}

const listConnections = asyncHandler(async (req, res) => {
  const connections = await connectionModel.findByPatient(req.userId);
  const labIds = connections.map((c) => c.labId);
  const labs = await labModel.collection().find({ _id: { $in: labIds } }).toArray();
  const labsById = new Map(labs.map((l) => [l._id.toString(), l]));

  res.json({
    connections: connections.map((c) => ({
      id: c._id,
      status: c.status,
      shareAll: c.shareAll,
      sharedFolderIds: c.sharedFolderIds,
      labName: labsById.get(c.labId.toString())?.name || 'Unknown Partner',
      createdAt: c.createdAt,
    })),
  });
});

async function getOwnedConnection(userId, connectionId) {
  const connection = await connectionModel.findById(userId, connectionId);
  if (!connection) {
    throw new ApiError(404, 'Connection not found', 'CONNECTION_NOT_FOUND');
  }
  return connection;
}

const acceptSchema = z.object({
  shareAll: z.boolean().optional(),
  folderIds: z.array(z.string()).optional(),
});

const acceptConnection = asyncHandler(async (req, res) => {
  const connection = await getOwnedConnection(req.userId, parseObjectId(req.params.id));
  const folderIds = (req.body.folderIds || []).map(parseObjectId);

  // Confirm every folder actually belongs to this patient before granting
  // partner access to it.
  for (const folderId of folderIds) {
    const folder = await vaultFolderModel.findById(req.userId, folderId);
    if (!folder) {
      throw new ApiError(400, 'Invalid folder selection', 'INVALID_FOLDER');
    }
  }

  await connectionModel.accept(connection._id, { shareAll: !!req.body.shareAll, sharedFolderIds: folderIds });
  res.json({ success: true });
});

const declineConnection = asyncHandler(async (req, res) => {
  const connection = await getOwnedConnection(req.userId, parseObjectId(req.params.id));
  await connectionModel.decline(connection._id);
  res.json({ success: true });
});

const updateConnectionAccess = asyncHandler(async (req, res) => {
  const connection = await getOwnedConnection(req.userId, parseObjectId(req.params.id));
  const folderIds = (req.body.folderIds || []).map(parseObjectId);

  // Confirm every folder actually belongs to this patient
  for (const folderId of folderIds) {
    const folder = await vaultFolderModel.findById(req.userId, folderId);
    if (!folder) {
      throw new ApiError(400, 'Invalid folder selection', 'INVALID_FOLDER');
    }
  }

  await connectionModel.accept(connection._id, { shareAll: !!req.body.shareAll, sharedFolderIds: folderIds });
  res.json({ success: true });
});

const getConnectionDetail = asyncHandler(async (req, res) => {
  const connection = await getOwnedConnection(req.userId, parseObjectId(req.params.id));
  const lab = await labModel.collection().findOne({ _id: connection.labId });
  
  if (!lab) {
    throw new ApiError(404, 'Partner not found', 'PARTNER_NOT_FOUND');
  }

  // Find the patient record the lab created for this user
  const patient = await patientModel.findByLabIdAndUserId(lab._id, req.userId);
  let medicalRecords = [];
  let prescriptions = [];

  if (patient) {
    medicalRecords = await medicalRecordModel.findByLabIdAndPatientId(lab._id, patient._id);
    prescriptions = await prescriptionModel.findByLabIdAndPatientId(lab._id, patient._id);
  }

  res.json({
    connection: {
      id: connection._id,
      status: connection.status,
      shareAll: connection.shareAll,
      sharedFolderIds: connection.sharedFolderIds,
      labName: lab.name,
      createdAt: connection.createdAt,
    },
    medicalRecords,
    prescriptions,
  });
});

module.exports = {
  listConnections,
  acceptSchema,
  acceptConnection,
  declineConnection,
  updateConnectionAccess,
  getConnectionDetail,
};
