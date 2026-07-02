const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const userModel = require('../models/user.model');
const walletModel = require('../models/wallet.model');
const refreshTokenModel = require('../models/refreshToken.model');
const { ApiError } = require('../middleware/errorHandler');

const ACCESS_TOKEN_TTL = '15m';
const BCRYPT_COST = 12;

function hashRefreshToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function issueAccessToken(userId) {
  return jwt.sign({ sub: userId.toString() }, env.jwtAccessSecret, { expiresIn: ACCESS_TOKEN_TTL });
}

async function issueTokenPair(userId) {
  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  await refreshTokenModel.create(userId, hashRefreshToken(rawRefreshToken));
  return {
    accessToken: issueAccessToken(userId),
    refreshToken: rawRefreshToken,
  };
}

async function register({ fullName, dateOfBirth, gender, address, email, password, role }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists', 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const user = await userModel.create({
    fullName,
    dateOfBirth,
    gender,
    address,
    email,
    passwordHash,
    role,
  });
  await walletModel.createForUser(user._id);

  const tokens = await issueTokenPair(user._id);
  return { user: userModel.toPublic(user), ...tokens };
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const tokens = await issueTokenPair(user._id);
  return { user: userModel.toPublic(user), ...tokens };
}

async function refresh(rawRefreshToken) {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const stored = await refreshTokenModel.findValidByHash(tokenHash);
  if (!stored) {
    throw new ApiError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }

  await refreshTokenModel.revokeById(stored._id);
  return issueTokenPair(stored.userId);
}

async function logout(rawRefreshToken) {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const stored = await refreshTokenModel.findValidByHash(tokenHash);
  if (stored) {
    await refreshTokenModel.revokeById(stored._id);
  }
}

module.exports = { register, login, refresh, logout, issueTokenPair };
