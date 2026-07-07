const { z } = require('zod');
const { ObjectId } = require('mongodb');

const authService = require('../services/auth.service');
const otpService = require('../services/otp.service');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { ROLE_TO_PLAN_TYPE } = require('../utils/planAccess');

const EMAIL_VERIFY_PURPOSE = 'email_verify';

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
  state: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  emailVerificationToken: z.string().min(1),
});

const sendOtpSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
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

const sendOtp = asyncHandler(async (req, res) => {
  await otpService.sendOtp(req.body.email, EMAIL_VERIFY_PURPOSE);
  res.status(204).send();
});

const verifyOtp = asyncHandler(async (req, res) => {
  const emailVerificationToken = await otpService.verifyOtp(
    req.body.email,
    req.body.code,
    EMAIL_VERIFY_PURPOSE
  );
  res.json({ emailVerificationToken });
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
  res.json({ user: await userModel.toPublicWithAvatar(user) });
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
  res.json({ user: await userModel.toPublicWithAvatar(await userModel.findById(req.userId)) });
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
  res.json({ user: await userModel.toPublicWithAvatar(await userModel.findById(req.userId)) });
});

const presignAvatarSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
});

const presignAvatar = asyncHandler(async (req, res) => {
  const result = await authService.presignAvatarUpload(req.userId, req.body);
  res.status(201).json(result);
});

const confirmAvatarSchema = z.object({
  s3Key: z.string().min(1),
});

const confirmAvatar = asyncHandler(async (req, res) => {
  const user = await authService.confirmAvatarUpload(req.userId, req.body.s3Key);
  res.json({ user });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const changePassword = asyncHandler(async (req, res) => {
  const tokens = await authService.changePassword(
    req.userId,
    req.body.currentPassword,
    req.body.newPassword
  );
  res.json(tokens);
});

const deleteAccountSchema = z.object({
  password: z.string().min(1),
});

const deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.userId, req.body.password);
  res.status(204).send();
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  sendOtpSchema,
  verifyOtpSchema,
  updatePlanSchema,
  updateMedicalProfileSchema,
  presignAvatarSchema,
  confirmAvatarSchema,
  changePasswordSchema,
  deleteAccountSchema,
  register,
  sendOtp,
  verifyOtp,
  login,
  refresh,
  logout,
  me,
  updatePlan,
  updateMedicalProfile,
  presignAvatar,
  confirmAvatar,
  changePassword,
  deleteAccount,
};
