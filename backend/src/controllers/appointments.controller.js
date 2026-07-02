const { z } = require('zod');
const { ObjectId } = require('mongodb');

const appointmentService = require('../services/appointment.service');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const createSchema = z.object({
  labId: z.string().min(1),
  testId: z.string().min(1),
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
  res.json({ days });
});

const create = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment(req.userId, {
    labId: parseObjectId(req.body.labId),
    testId: parseObjectId(req.body.testId),
    scheduledDate: req.body.scheduledDate,
    scheduledTimeSlot: req.body.scheduledTimeSlot,
  });
  res.status(201).json({ appointment });
});

const pay = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.payAppointment(req.userId, parseObjectId(req.params.id));
  res.json({ appointment });
});

const list = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.listAppointments(req.userId);
  res.json({ appointments });
});

module.exports = { createSchema, availability, create, pay, list };
