const { z } = require('zod');

const authService = require('../services/auth.service');
const userModel = require('../models/user.model');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const registerSchema = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.enum(['male', 'female', 'prefer_not_to_say']),
  address: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['patient', 'provider']).optional(),
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

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  register,
  login,
  refresh,
  logout,
  me,
};
