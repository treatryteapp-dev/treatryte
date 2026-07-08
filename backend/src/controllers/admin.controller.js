const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { z } = require('zod');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getS3PresignedUrl } = require('@aws-sdk/s3-request-presigner');
const labModel = require('../models/lab.model');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const appointmentModel = require('../models/appointment.model');
const settlementModel = require('../models/settlement.model');
const platformSettingsModel = require('../models/platformSettings.model');
const vaultFileModel = require('../models/vaultFile.model');
const { signVaultUrl } = require('../cloudfrontSign');
const { getS3Client } = require('../aws');
const env = require('../config/env');
const emailService = require('../services/email.service');
const nomba = require('../nomba');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid id', 'INVALID_ID');
  }
  return new ObjectId(id);
}

// Fire-and-forget: a failing/unreachable webhook must never break the
// approve/reject response itself.
async function notifyPartnerStatusWebhook(lab, status) {
  try {
    const { partnerStatusWebhookUrl } = await platformSettingsModel.getSettings();
    if (!partnerStatusWebhookUrl) return;
    await fetch(partnerStatusWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        labId: lab._id.toString(),
        name: lab.name,
        status,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error('Partner status webhook failed:', err.message);
  }
}

const listLabs = asyncHandler(async (req, res) => {
  const labs = await labModel.collection().find().sort({ createdAt: -1 }).toArray();
  res.json({ labs });
});

const ADMIN_DOC_TTL_SECONDS = 300;

/**
 * Generates a presigned URL for admin document review.
 * Tries CloudFront first (preferred, private distribution). Falls back to
 * a presigned S3 GetObject URL so admin can always preview documents even
 * when CloudFront signing keys aren't configured in the environment.
 */
async function signAdminDocUrl(s3Key, mimeType) {
  try {
    return signVaultUrl(s3Key, { ttlSeconds: ADMIN_DOC_TTL_SECONDS });
  } catch {
    // CloudFront not configured - generate a presigned S3 URL instead.
    // ResponseContentDisposition: 'inline' prevents the browser from
    // treating this as a download; the Content-Type tells the browser
    // how to render it (PDF viewer, image, etc.).
    return getS3PresignedUrl(
      getS3Client(),
      new GetObjectCommand({
        Bucket: env.aws.s3Bucket,
        Key: s3Key,
        ResponseContentDisposition: 'inline',
        ResponseContentType: mimeType || 'application/octet-stream',
      }),
      { expiresIn: ADMIN_DOC_TTL_SECONDS },
    );
  }
}

const listLabDocuments = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);
  const files = await vaultFileModel.findByLabId(labId, 'partner_verification');
  const documents = await Promise.all(
    files.map(async (f) => {
      let url = null;
      if (f.status === 'uploaded') {
        try {
          url = await signAdminDocUrl(f.s3Key, f.mimeType);
        } catch (err) {
          console.error(`Failed to generate URL for vault file ${f._id}:`, err.message);
        }
      }
      return {
        id: f._id,
        fileName: f.fileName,
        mimeType: f.mimeType,
        status: f.status,
        uploadedAt: f.uploadedAt,
        url,
      };
    }),
  );
  res.json({ documents });
});

const approveLab = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);

  // Check if the lab already has an account number assigned (e.g. re-approval).
  const existing = await labModel.findById(labId);
  if (!existing) {
    throw new ApiError(404, 'Laboratory profile not found', 'NOT_FOUND');
  }

  const updates = { status: 'approved', updatedAt: new Date() };
  if (!existing.accountNumber) {
    // Generate a unique partner account number: TR- followed by 8 uppercase hex chars.
    updates.accountNumber = 'TR-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  const lab = await labModel.collection().findOneAndUpdate(
    { _id: labId },
    { $set: updates },
    { returnDocument: 'after' },
  );
  notifyPartnerStatusWebhook(lab, 'approved');
  res.json({ success: true, accountNumber: lab.accountNumber });
});


const rejectLabSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

const rejectLab = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);
  const reason = req.body.reason?.trim() || null;
  const lab = await labModel.collection().findOneAndUpdate(
    { _id: labId },
    { $set: { status: 'rejected', rejectionReason: reason, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  if (!lab) {
    throw new ApiError(404, 'Laboratory profile not found', 'NOT_FOUND');
  }
  notifyPartnerStatusWebhook(lab, 'rejected');

  const owner = await userModel.findById(lab.userId);
  if (owner) {
    const { subject, html, text } = emailService.partnerRejectionEmail({ facilityName: lab.name, reason });
    emailService.sendEmail({ to: owner.email, toName: owner.fullName, subject, html, text });
  }

  res.json({ success: true });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalPatients = await userModel.collection().countDocuments({ role: 'patient' });
  const totalProviders = await userModel.collection().countDocuments({ role: 'provider' });
  const approvedPartners = await labModel.collection().countDocuments({ status: 'approved' });
  const pendingApprovals = await labModel.collection().countDocuments({ status: 'pending' });
  const totalAppointments = await appointmentModel.collection().countDocuments();

  // Real platform earnings: the flat service fee on every confirmed
  // appointment plus the platform's cut from partner settlements. This is
  // deliberately NOT a sum of all `transactions` - that collection also
  // holds wallet top-ups and withdrawals, which are not platform revenue.
  const confirmedAppointments = await appointmentModel.collection().find({ status: 'confirmed' }).toArray();
  const serviceFeeRevenueKobo = confirmedAppointments.reduce((sum, a) => sum + a.serviceFee, 0);
  const settlements = await settlementModel.collection().find({ status: { $in: ['pending', 'completed'] } }).toArray();
  const settlementFeeRevenueKobo = settlements.reduce((sum, s) => sum + s.platformFeeKobo, 0);
  const totalRevenue = (serviceFeeRevenueKobo + settlementFeeRevenueKobo) / 100;

  const outstandingSettlementsKobo = 0; // Legacy settlement system deprecated in favor of instant wallet credits

  let systemHealth = 100.00;
  try {
    await getDb().command({ ping: 1 });
  } catch {
    systemHealth = 0.00;
  }

  // "Paying" = has a planId that resolves to a plan with a real price,
  // same check used in listSubscriptions.
  const plans = await planModel.findAll();
  const users = await userModel.collection().find().toArray();
  const isPaying = (user) => {
    const plan = user.planId && plans.find(p => p._id.toString() === user.planId.toString());
    return !!plan && plan.price > 0;
  };
  const payingPatients = users.filter(u => u.role === 'patient' && isPaying(u)).length;
  const payingProviders = users.filter(u => u.role === 'provider' && isPaying(u)).length;

  // Rolling 7-month window ending at the current month, so this doesn't go
  // blank once the calendar moves past a hardcoded year/range.
  const appointments = await appointmentModel.collection().find().toArray();
  const activityData = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = monthDate.toLocaleString('en-US', { month: 'short' });

    const newSignups = users.filter(u => {
      const date = new Date(u.createdAt);
      return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth();
    }).length;

    const monthAppointments = appointments.filter(a => {
      const date = new Date(a.createdAt);
      return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth();
    }).length;

    activityData.push({
      name: monthName,
      newSignups,
      appointments: monthAppointments,
    });
  }

  res.json({
    stats: {
      totalPatients,
      totalProviders,
      approvedPartners,
      payingPatients,
      payingProviders,
      pendingApprovals,
      totalAppointments,
      totalRevenue,
      outstandingSettlementsKobo,
      systemHealth,
      activityData,
    }
  });
});

const listSubscriptions = asyncHandler(async (req, res) => {
  // Admin accounts aren't patients or partners - exclude them so they don't
  // show up mislabeled as "Individual" subscribers.
  const users = await userModel.collection().find({ role: { $in: ['patient', 'provider'] } }).toArray();
  const plans = await planModel.findAll();
  
  // Format users into subscription schema
  const subscriptions = users.map(user => {
    const isProvider = user.role === 'provider';
    const userPlan = (user.planId && plans.find(p => p._id.toString() === user.planId.toString()))
      || { name: 'Unassigned', price: 0 };

    return {
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      initial: user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'TR',
      type: isProvider ? 'Partner' : 'Individual',
      tier: userPlan.name,
      mrr: userPlan.price,
      status: user.billingStatus || 'active',
    };
  });

  res.json({ subscriptions });
});

const updateSubscriptionStatus = asyncHandler(async (req, res) => {
  const userId = parseObjectId(req.params.id);
  const { status } = req.body;

  if (!['active', 'paused', 'suspended'].includes(status)) {
    throw new ApiError(400, 'Invalid status', 'INVALID_STATUS');
  }

  const result = await userModel.collection().updateOne(
    { _id: userId },
    { $set: { billingStatus: status, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, 'User profile not found', 'NOT_FOUND');
  }

  res.json({ success: true });
});

const listTransactions = asyncHandler(async (req, res) => {
  const transactions = await getDb().collection('transactions')
    .find()
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  const populated = [];
  for (const tx of transactions) {
    const user = await userModel.findById(tx.userId);
    populated.push({
      id: tx._id.toString(),
      transactionId: tx.nombaTransactionId || tx.nombaTransferRef || tx._id.toString().substring(0, 10).toUpperCase(),
      userName: user ? user.fullName || user.email : 'Unknown User',
      category: tx.category ? tx.category.replace('_', ' ').toUpperCase() : 'PAYMENT',
      amount: tx.amount / 100,
      status: tx.status || 'pending',
      createdAt: tx.createdAt,
    });
  }

  res.json({ transactions: populated });
});

const listPlans = asyncHandler(async (req, res) => {
  const plans = await planModel.findAll();
  res.json({ plans });
});

const createPlan = asyncHandler(async (req, res) => {
  const { name, price, interval, type, features, excludedFeatures, transactionSplit, maxVaultFolders, maxVaultFiles } =
    req.body;
  if (!name || price === undefined || price === null) {
    throw new ApiError(400, 'Name and price are required', 'BAD_REQUEST');
  }
  const plan = await planModel.create({
    name,
    price,
    interval,
    type,
    features,
    excludedFeatures,
    transactionSplit,
    maxVaultFolders,
    maxVaultFiles,
  });
  res.status(201).json({ plan });
});

const deletePlan = asyncHandler(async (req, res) => {
  const planId = parseObjectId(req.params.id);
  await getDb().collection('plans').deleteOne({ _id: planId });
  res.json({ success: true });
});

const updatePlan = asyncHandler(async (req, res) => {
  const planId = parseObjectId(req.params.id);
  const { name, price, interval, type, features, excludedFeatures, transactionSplit, maxVaultFolders, maxVaultFiles } =
    req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (price !== undefined) updates.price = Number(price);
  if (interval !== undefined) updates.interval = interval;
  if (type !== undefined) updates.type = type;
  if (features !== undefined) updates.features = features;
  if (excludedFeatures !== undefined) updates.excludedFeatures = excludedFeatures;
  if (transactionSplit !== undefined) updates.transactionSplit = Number(transactionSplit);
  if (maxVaultFolders !== undefined) updates.maxVaultFolders = maxVaultFolders === null ? null : Number(maxVaultFolders);
  if (maxVaultFiles !== undefined) updates.maxVaultFiles = maxVaultFiles === null ? null : Number(maxVaultFiles);

  const result = await planModel.update(planId, updates);
  if (result.matchedCount === 0) {
    throw new ApiError(404, 'Plan not found', 'NOT_FOUND');
  }
  const updated = await planModel.collection().findOne({ _id: planId });
  res.json({ plan: updated });
});


const listBanks = asyncHandler(async (req, res) => {
  const banks = await nomba.listBanks();
  res.json({ banks });
});

const updateLabBankDetails = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);
  const { bankCode, accountNumber } = req.body;
  if (!bankCode || !accountNumber) {
    throw new ApiError(400, 'bankCode and accountNumber are required', 'BAD_REQUEST');
  }

  const lab = await labModel.findById(labId);
  if (!lab) {
    throw new ApiError(404, 'Laboratory profile not found', 'NOT_FOUND');
  }

  const { accountName } = await nomba.lookupBankAccount({ accountNumber, bankCode });
  const banks = await nomba.listBanks();
  const bank = banks.find(b => (b.code || b.bankCode) === bankCode);
  const bankName = bank ? (bank.name || bank.bankName) : lab.bankDetails?.bankName || '';

  await labModel.update(labId, {
    bankDetails: { bankCode, bankName, accountNumber, accountName },
  });

  res.json({ success: true, accountName });
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  currentPassword: z.string().min(1),
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email, currentPassword } = req.body;

  const user = await userModel.findById(req.userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND');
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Current password is incorrect', 'INVALID_CREDENTIALS');
  }

  const normalizedEmail = email.toLowerCase();
  if (normalizedEmail !== user.email) {
    const existing = await userModel.findByEmail(normalizedEmail);
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists', 'EMAIL_TAKEN');
    }
  }

  await userModel.update(req.userId, { fullName, email: normalizedEmail });
  const updated = await userModel.findById(req.userId);
  res.json({ user: await userModel.toPublicWithAvatar(updated) });
});

const listPlatformSettings = asyncHandler(async (req, res) => {
  const settings = await platformSettingsModel.getSettings();
  res.json({ settings });
});

const updatePlatformSettings = asyncHandler(async (req, res) => {
  const { partnerStatusWebhookUrl, serviceFeeKobo } = req.body;
  const updates = { partnerStatusWebhookUrl: partnerStatusWebhookUrl || '' };
  if (serviceFeeKobo !== undefined) {
    updates.serviceFeeKobo = Number(serviceFeeKobo);
  }
  const settings = await platformSettingsModel.updateSettings(updates);
  res.json({ settings });
});

const { getDb } = require('../db');

// Presence checks only - booleans, never the actual secret values - so a
// misconfigured deployment (e.g. an empty NOMBA_WEBHOOK_SECRET silently
// failing closed) shows up here instead of only being discoverable once a
// real feature breaks in production.
const configHealth = asyncHandler(async (req, res) => {
  res.json({
    jwtAccessSecret: Boolean(env.jwtAccessSecret),
    awsS3Bucket: Boolean(env.aws.s3Bucket),
    cloudfrontKeyPairId: Boolean(env.aws.cloudfrontKeyPairId),
    cloudfrontPrivateKey: Boolean(
      env.aws.cloudfrontPrivateKeyBase64 || env.aws.cloudfrontPrivateKeyPath
    ),
    nombaWebhookSecret: Boolean(env.nomba.webhookSecret),
    nombaClientId: Boolean(env.nomba.clientId),
    nombaClientSecret: Boolean(env.nomba.clientSecret),
    brevoApiKey: Boolean(env.email.brevoApiKey),
    emailFromAddress: Boolean(env.email.fromAddress),
  });
});

module.exports = {
  listLabs,
  listLabDocuments,
  approveLab,
  rejectLabSchema,
  rejectLab,
  getDashboardStats,
  listSubscriptions,
  updateSubscriptionStatus,
  listTransactions,
  listPlans,
  createPlan,
  deletePlan,
  updatePlan,
  listBanks,
  updateLabBankDetails,
  updateProfileSchema,
  updateProfile,
  listPlatformSettings,
  updatePlatformSettings,
  configHealth,
};
