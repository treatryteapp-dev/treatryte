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
const planModel = require('../models/plan.model');
const { ApiError } = require('../middleware/errorHandler');
const { ROLE_TO_PLAN_TYPE } = require('../utils/planAccess');

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
  emailVerificationToken,
}) {
  let decoded;
  try {
    decoded = jwt.verify(emailVerificationToken, env.jwtAccessSecret);
  } catch {
    throw new ApiError(400, 'Email verification expired - request a new code', 'EMAIL_NOT_VERIFIED');
  }
  if (decoded.purpose !== 'email_verify' || decoded.email !== email.toLowerCase()) {
    throw new ApiError(400, 'Email not verified', 'EMAIL_NOT_VERIFIED');
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists', 'EMAIL_TAKEN');
  }

  // Every account starts on its role's free plan unless a paid planId was
  // explicitly passed - so plan-gated limits (vault storage, sharing, etc.)
  // are enforced from a real plan document from day one instead of every
  // feature having to special-case a null planId as "assume free tier".
  let resolvedPlanId = planId;
  if (!resolvedPlanId) {
    const freePlan = await planModel.collection().findOne({
      type: ROLE_TO_PLAN_TYPE[role || 'patient'],
      price: 0,
      status: 'active',
    });
    if (freePlan) resolvedPlanId = freePlan._id.toString();
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
    planId: resolvedPlanId,
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

async function changePassword(userId, currentPassword, newPassword) {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND');
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Current password is incorrect', 'INVALID_CREDENTIALS');
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
  await userModel.update(userId, { passwordHash });

  // Every other session's refresh token is invalidated on a password change
  // (standard security practice) - issue a fresh pair so this session stays
  // logged in instead of being logged out by its own request.
  await refreshTokenModel.revokeAllForUser(userId);
  return issueTokenPair(userId);
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
  changePassword,
  deleteAccount,
};
