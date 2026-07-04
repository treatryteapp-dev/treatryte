const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const labModel = require('../models/lab.model');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const appointmentModel = require('../models/appointment.model');
const settlementModel = require('../models/settlement.model');
const settlementService = require('../services/settlement.service');
const platformSettingsModel = require('../models/platformSettings.model');
const vaultFileModel = require('../models/vaultFile.model');
const { signVaultUrl } = require('../cloudfrontSign');
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

const listLabDocuments = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);
  const files = await vaultFileModel.findByLabId(labId, 'partner_verification');
  const documents = files.map((f) => ({
    id: f._id,
    fileName: f.fileName,
    mimeType: f.mimeType,
    uploadedAt: f.uploadedAt,
    url: signVaultUrl(f.s3Key),
  }));
  res.json({ documents });
});

const approveLab = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);
  const lab = await labModel.collection().findOneAndUpdate(
    { _id: labId },
    { $set: { status: 'approved', updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  if (!lab) {
    throw new ApiError(404, 'Laboratory profile not found', 'NOT_FOUND');
  }
  notifyPartnerStatusWebhook(lab, 'approved');
  res.json({ success: true });
});

const rejectLab = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);
  const lab = await labModel.collection().findOneAndUpdate(
    { _id: labId },
    { $set: { status: 'rejected', updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  if (!lab) {
    throw new ApiError(404, 'Laboratory profile not found', 'NOT_FOUND');
  }
  notifyPartnerStatusWebhook(lab, 'rejected');
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

  const outstanding = await settlementService.computeOutstanding();
  const outstandingSettlementsKobo = outstanding.reduce((sum, o) => sum + o.netAmountKobo, 0);

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
  const { name, price, interval, type, features, excludedFeatures, nombaPlanId, transactionSplit } = req.body;
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
    nombaPlanId,
    transactionSplit
  });
  res.status(201).json({ plan });
});

const deletePlan = asyncHandler(async (req, res) => {
  const planId = parseObjectId(req.params.id);
  await getDb().collection('plans').deleteOne({ _id: planId });
  res.json({ success: true });
});

const listSettlements = asyncHandler(async (req, res) => {
  const outstanding = await settlementService.computeOutstanding();
  const history = await settlementModel.listHistory();
  res.json({ outstanding, history });
});

const triggerSettlements = asyncHandler(async (req, res) => {
  const summary = await settlementService.triggerBatch();
  res.json({ summary });
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
  res.json({ user: userModel.toPublic(updated) });
});

const listPlatformSettings = asyncHandler(async (req, res) => {
  const settings = await platformSettingsModel.getSettings();
  res.json({ settings });
});

const updatePlatformSettings = asyncHandler(async (req, res) => {
  const { partnerStatusWebhookUrl } = req.body;
  const settings = await platformSettingsModel.updateSettings({ partnerStatusWebhookUrl: partnerStatusWebhookUrl || '' });
  res.json({ settings });
});

const { getDb } = require('../db');

module.exports = {
  listLabs,
  listLabDocuments,
  approveLab,
  rejectLab,
  getDashboardStats,
  listSubscriptions,
  updateSubscriptionStatus,
  listTransactions,
  listPlans,
  createPlan,
  deletePlan,
  listSettlements,
  triggerSettlements,
  listBanks,
  updateLabBankDetails,
  updateProfileSchema,
  updateProfile,
  listPlatformSettings,
  updatePlatformSettings,
};
