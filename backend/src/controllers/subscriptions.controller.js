const { z } = require('zod');
const { ObjectId } = require('mongodb');

const subscriptionService = require('../services/subscription.service');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const upgradeSchema = z.object({
  planId: z.string().min(1),
});

const upgrade = asyncHandler(async (req, res) => {
  if (!ObjectId.isValid(req.body.planId)) {
    throw new ApiError(400, 'Invalid plan id', 'INVALID_ID');
  }
  const result = await subscriptionService.initiateUpgrade(req.userId, new ObjectId(req.body.planId));
  res.status(result.requiresPayment ? 201 : 200).json(result);
});

const getCurrent = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getCurrent(req.userId);
  res.json({ subscription });
});

const cancel = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.cancelSubscription(req.userId);
  res.json({ subscription });
});

module.exports = {
  upgradeSchema,
  upgrade,
  getCurrent,
  cancel,
};
