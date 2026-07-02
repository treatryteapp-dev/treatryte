const { z } = require('zod');
const { ObjectId } = require('mongodb');

const medicationService = require('../services/medication.service');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const moodSchema = z.object({
  mood: z.string().min(1),
  note: z.string().optional(),
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

module.exports = { moodSchema, list, today, logDose, submitMood };
