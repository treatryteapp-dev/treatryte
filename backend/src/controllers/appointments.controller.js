const { z } = require('zod');
const { ObjectId } = require('mongodb');

const appointmentService = require('../services/appointment.service');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const createSchema = z.object({
  labId: z.string().min(1),
  testIds: z.array(z.string().min(1)).min(1),
  scheduledDate: z.string().min(1),
  scheduledTimeSlot: z.string().min(1),
});

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid id', 'INVALID_ID');
  }
  return new ObjectId(id);
}

const availability = asyncHandler(async (req, res) => {
  const days = await appointmentService.getAvailability(parseObjectId(req.query.labId));
  const serviceFeeKobo = await appointmentService.getServiceFee(req.userId);
  res.json({ days, serviceFeeKobo });
});

const create = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment(req.userId, {
    labId: parseObjectId(req.body.labId),
    testIds: req.body.testIds.map(parseObjectId),
    scheduledDate: req.body.scheduledDate,
    scheduledTimeSlot: req.body.scheduledTimeSlot,
  });
  res.status(201).json({ appointment });
});

const list = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.listAppointments(req.userId);
  res.json({ appointments });
});

module.exports = { createSchema, availability, create, list };
