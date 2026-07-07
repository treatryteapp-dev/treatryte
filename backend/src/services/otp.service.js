const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const otpModel = require('../models/otp.model');
const emailService = require('../services/email.service');
const { ApiError } = require('../middleware/errorHandler');

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const VERIFICATION_TOKEN_TTL = '20m';

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

async function sendOtp(email, purpose) {
  const existing = await otpModel.findActiveByEmail(email, purpose);
  if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new ApiError(429, 'Please wait a moment before requesting another code', 'OTP_COOLDOWN');
  }

  const code = generateCode();
  await otpModel.create({
    email,
    purpose,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });

  await emailService.sendEmail({ to: email, ...emailService.otpEmail({ code }) });
}

async function verifyOtp(email, code, purpose) {
  const record = await otpModel.findActiveByEmail(email, purpose);
  if (!record) {
    throw new ApiError(400, 'Invalid or expired code', 'INVALID_OTP');
  }
  if (record.attempts >= otpModel.MAX_ATTEMPTS) {
    throw new ApiError(400, 'Too many incorrect attempts - request a new code', 'INVALID_OTP');
  }

  if (hashCode(code) !== record.codeHash) {
    await otpModel.incrementAttempts(record._id);
    throw new ApiError(400, 'Invalid or expired code', 'INVALID_OTP');
  }

  await otpModel.consume(record._id);
  return jwt.sign({ email: email.toLowerCase(), purpose }, env.jwtAccessSecret, {
    expiresIn: VERIFICATION_TOKEN_TTL,
  });
}

module.exports = { sendOtp, verifyOtp };
