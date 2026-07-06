const { z } = require('zod');
const { ObjectId } = require('mongodb');

const authService = require('../services/auth.service');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { ROLE_TO_PLAN_TYPE } = require('../utils/planAccess');

const registerSchema = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.enum(['male', 'female', 'prefer_not_to_say']),
  address: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['patient', 'provider']).optional(),
  planId: z.string().optional(),
  facilityName: z.string().optional(),
  licenseNumber: z.string().optional(),
  services: z.array(z.string()).optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  res.json(result);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
});

const me = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND');
  }
  res.json({ user: userModel.toPublic(user) });
});

const updatePlanSchema = z.object({
  planId: z.string().min(1),
});

const updateMedicalProfileSchema = z.object({
  bloodGroup: z.string().min(1).optional().nullable(),
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
});

// Self-service, free plans only: sets planId directly with no payment
// charge. Paid plans must go through POST /api/subscriptions/upgrade so a
// real Nomba charge is confirmed before the plan takes effect.
const updatePlan = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND');
  }

  const expectedType = ROLE_TO_PLAN_TYPE[user.role];
  if (!expectedType) {
    throw new ApiError(400, 'This account type cannot select a plan', 'BAD_REQUEST');
  }

  if (!ObjectId.isValid(req.body.planId)) {
    throw new ApiError(400, 'Invalid plan id', 'INVALID_ID');
  }
  const plan = await planModel.collection().findOne({ _id: new ObjectId(req.body.planId) });
  if (!plan) {
    throw new ApiError(404, 'Plan not found', 'PLAN_NOT_FOUND');
  }
  if (plan.type !== expectedType) {
    throw new ApiError(400, `This plan is not available for ${user.role} accounts`, 'PLAN_TYPE_MISMATCH');
  }
  if (plan.price > 0) {
    throw new ApiError(400, 'Use POST /api/subscriptions/upgrade to switch to a paid plan', 'PAID_PLAN_REQUIRES_UPGRADE');
  }

  await userModel.update(req.userId, { planId: plan._id });
  res.json({ user: userModel.toPublic(await userModel.findById(req.userId)) });
});

// Self-service only: a provider adding a prescription does not touch this -
// patients own their own blood group/allergies/conditions.
const updateMedicalProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND');
  }

  const current = user.medicalProfile || { bloodGroup: null, allergies: [], conditions: [] };
  const medicalProfile = {
    bloodGroup: req.body.bloodGroup !== undefined ? req.body.bloodGroup : current.bloodGroup,
    allergies: req.body.allergies !== undefined ? req.body.allergies : current.allergies,
    conditions: req.body.conditions !== undefined ? req.body.conditions : current.conditions,
  };

  await userModel.update(req.userId, { medicalProfile });
  res.json({ user: userModel.toPublic(await userModel.findById(req.userId)) });
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  updatePlanSchema,
  updateMedicalProfileSchema,
  register,
  login,
  refresh,
  logout,
  me,
  updatePlan,
  updateMedicalProfile,
};
