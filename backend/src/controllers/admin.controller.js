const { ObjectId } = require('mongodb');
const labModel = require('../models/lab.model');
const userModel = require('../models/user.model');
const appointmentModel = require('../models/appointment.model');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid id', 'INVALID_ID');
  }
  return new ObjectId(id);
}

const listLabs = asyncHandler(async (req, res) => {
  const labs = await labModel.collection().find().sort({ createdAt: -1 }).toArray();
  res.json({ labs });
});

const approveLab = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);
  const result = await labModel.collection().updateOne(
    { _id: labId },
    { $set: { status: 'approved', updatedAt: new Date() } }
  );
  if (result.matchedCount === 0) {
    throw new ApiError(404, 'Laboratory profile not found', 'NOT_FOUND');
  }
  res.json({ success: true });
});

const rejectLab = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);
  const result = await labModel.collection().updateOne(
    { _id: labId },
    { $set: { status: 'rejected', updatedAt: new Date() } }
  );
  if (result.matchedCount === 0) {
    throw new ApiError(404, 'Laboratory profile not found', 'NOT_FOUND');
  }
  res.json({ success: true });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalPatients = await userModel.collection().countDocuments({ role: 'patient' });
  const totalProviders = await userModel.collection().countDocuments({ role: 'provider' });
  const pendingApprovals = await labModel.collection().countDocuments({ status: 'pending' });
  const totalAppointments = await appointmentModel.collection().countDocuments();
  
  res.json({
    stats: {
      totalPatients,
      totalProviders,
      pendingApprovals,
      totalAppointments,
    }
  });
});

module.exports = {
  listLabs,
  approveLab,
  rejectLab,
  getDashboardStats,
};
