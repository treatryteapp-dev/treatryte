const { z } = require('zod');
const { ObjectId } = require('mongodb');

const medicationService = require('../services/medication.service');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const moodSchema = z.object({
  mood: z.string().min(1),
  note: z.string().optional(),
  partnerId: z.string().optional(),
});

const personalSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  scheduleTimes: z.array(z.string()).min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid id', 'INVALID_ID');
  }
  return new ObjectId(id);
}

const list = asyncHandler(async (req, res) => {
  const result = await medicationService.getMedications(req.userId);
  res.json(result);
});

const today = asyncHandler(async (req, res) => {
  const result = await medicationService.getTodaySchedule(req.userId);
  res.json(result);
});

const providers = asyncHandler(async (req, res) => {
  const result = await medicationService.getProviders(req.userId);
  res.json(result);
});

const createPersonal = asyncHandler(async (req, res) => {
  const result = await medicationService.createPersonalMedication(req.userId, req.body);
  res.status(201).json(result);
});

const logDose = asyncHandler(async (req, res) => {
  const doseLog = await medicationService.logDose(req.userId, parseObjectId(req.params.doseLogId));
  res.json({ doseLog });
});

const submitMood = asyncHandler(async (req, res) => {
  const moodLog = await medicationService.submitMood(
    req.userId,
    parseObjectId(req.params.doseLogId),
    req.body,
  );
  res.status(201).json({ moodLog });
});

module.exports = { moodSchema, personalSchema, list, today, providers, createPersonal, logDose, submitMood };
