const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getS3SignedUrl } = require('@aws-sdk/s3-request-presigner');

const env = require('../config/env');
const { getS3Client } = require('../aws');
const userModel = require('../models/user.model');
const walletModel = require('../models/wallet.model');
const refreshTokenModel = require('../models/refreshToken.model');
const labModel = require('../models/lab.model');
const subscriptionModel = require('../models/subscription.model');
const { ApiError } = require('../middleware/errorHandler');

const AVATAR_PRESIGN_TTL_SECONDS = 300;

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

async function register({
  fullName,
  dateOfBirth,
  gender,
  address,
  email,
  password,
  role,
  planId,
  facilityName,
  licenseNumber,
  services,
  state,
  bankName,
  accountNumber,
}) {
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
    planId,
  });
  await walletModel.createForUser(user._id);

  if (role === 'provider') {
    await labModel.create({
      userId: user._id,
      name: facilityName || fullName,
      licenseNumber: licenseNumber || '',
      address: address,
      state: state || '',
      services: services || [],
      bankDetails: {
        bankName: bankName || 'GTBank',
        accountNumber: accountNumber || '',
      },
    });
  }

  const tokens = await issueTokenPair(user._id);
  return { user: await userModel.toPublicWithAvatar(user), ...tokens };
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user || user.status === 'deleted') {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const tokens = await issueTokenPair(user._id);
  return { user: await userModel.toPublicWithAvatar(user), ...tokens };
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

async function presignAvatarUpload(userId, { fileName, mimeType }) {
  const s3Key = `avatars/${userId.toString()}/${crypto.randomUUID()}-${fileName}`;

  const uploadUrl = await getS3SignedUrl(
    getS3Client(),
    new PutObjectCommand({ Bucket: env.aws.s3Bucket, Key: s3Key, ContentType: mimeType }),
    { expiresIn: AVATAR_PRESIGN_TTL_SECONDS },
  );

  return { uploadUrl, s3Key };
}

async function confirmAvatarUpload(userId, s3Key) {
  // Only allow confirming keys this endpoint itself would have generated for
  // this user - prevents a client from pointing avatarS3Key at another
  // user's (or an arbitrary) S3 object.
  if (!s3Key.startsWith(`avatars/${userId.toString()}/`)) {
    throw new ApiError(400, 'Invalid avatar key', 'INVALID_AVATAR_KEY');
  }

  try {
    await getS3Client().send(new HeadObjectCommand({ Bucket: env.aws.s3Bucket, Key: s3Key }));
  } catch {
    throw new ApiError(422, 'File was not found in storage - upload may have failed', 'UPLOAD_NOT_FOUND');
  }

  await userModel.update(userId, { avatarS3Key: s3Key });
  return userModel.toPublicWithAvatar(await userModel.findById(userId));
}

async function deleteAccount(userId, password) {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Incorrect password', 'INVALID_CREDENTIALS');
  }

  const wallet = await walletModel.findByUserId(userId);
  if (wallet && wallet.balance > 0) {
    throw new ApiError(
      422,
      'Please withdraw your wallet balance before deleting your account',
      'WALLET_BALANCE_NONZERO',
    );
  }

  const activeSubscription = await subscriptionModel.findActiveByUserId(userId);
  if (activeSubscription) {
    await subscriptionModel.cancelImmediately(activeSubscription._id);
  }

  await refreshTokenModel.revokeAllForUser(userId);
  await userModel.softDelete(userId);
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  issueTokenPair,
  presignAvatarUpload,
  confirmAvatarUpload,
  deleteAccount,
};
