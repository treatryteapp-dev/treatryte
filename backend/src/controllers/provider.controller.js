const { z } = require('zod');
const { ObjectId } = require('mongodb');

const labModel = require('../models/lab.model');
const testModel = require('../models/test.model');
const appointmentModel = require('../models/appointment.model');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid id', 'INVALID_ID');
  }
  return new ObjectId(id);
}

async function getProviderLab(userId) {
  const lab = await labModel.findByUserId(userId);
  if (!lab) {
    throw new ApiError(404, 'Provider laboratory profile not found', 'LAB_NOT_FOUND');
  }
  return lab;
}

const getProfile = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const user = await userModel.findById(req.userId);
  const plan = user?.planId ? await planModel.collection().findOne({ _id: user.planId }) : null;
  res.json({ lab, plan });
});

const listServices = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const services = await testModel.findByLabId(lab._id);
  res.json({ services });
});

const createServiceSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
  category: z.string().min(1),
});

const createService = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const service = await testModel.create({
    labId: lab._id,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
  });
  res.status(201).json({ service });
});

const updateServiceSchema = z.object({
  name: z.string().optional(),
  price: z.number().int().positive().optional(),
  category: z.string().optional(),
});

const updateService = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const testId = parseObjectId(req.params.id);
  const service = await testModel.findById(testId);
  if (!service) {
    throw new ApiError(404, 'Service not found', 'SERVICE_NOT_FOUND');
  }
  if (service.labId.toString() !== lab._id.toString()) {
    throw new ApiError(403, 'Unauthorized access to service', 'FORBIDDEN');
  }

  await testModel.update(testId, req.body);
  res.json({ success: true });
});

const deleteService = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const testId = parseObjectId(req.params.id);
  const service = await testModel.findById(testId);
  if (!service) {
    throw new ApiError(404, 'Service not found', 'SERVICE_NOT_FOUND');
  }
  if (service.labId.toString() !== lab._id.toString()) {
    throw new ApiError(403, 'Unauthorized access to service', 'FORBIDDEN');
  }

  await testModel.deleteById(testId);
  res.json({ success: true });
});

const listAppointments = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const appointments = await appointmentModel.listByLabId(lab._id);
  res.json({ appointments });
});

const checkInAppointment = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const appointmentId = parseObjectId(req.params.id);
  const appointment = await appointmentModel.collection().findOne({ _id: appointmentId });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found', 'APPOINTMENT_NOT_FOUND');
  }
  if (appointment.labId.toString() !== lab._id.toString()) {
    throw new ApiError(403, 'Unauthorized access to appointment', 'FORBIDDEN');
  }

  await appointmentModel.updateStatus(appointmentId, 'checked_in');
  res.json({ success: true });
});

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  getProfile,
  listServices,
  createService,
  updateService,
  deleteService,
  listAppointments,
  checkInAppointment,
};
