const { ObjectId } = require('mongodb');
const labModel = require('../models/lab.model');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const appointmentModel = require('../models/appointment.model');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid id', 'INVALID_ID');
  }
  return new ObjectId(id);
}

const listLabs = asyncHandler(async (req, res) => {
  const labs = await labModel.collection().find().sort({ createdAt: -1 }).toArray();
  res.json({ labs });
});

const approveLab = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);
  const result = await labModel.collection().updateOne(
    { _id: labId },
    { $set: { status: 'approved', updatedAt: new Date() } }
  );
  if (result.matchedCount === 0) {
    throw new ApiError(404, 'Laboratory profile not found', 'NOT_FOUND');
  }
  res.json({ success: true });
});

const rejectLab = asyncHandler(async (req, res) => {
  const labId = parseObjectId(req.params.id);
  const result = await labModel.collection().updateOne(
    { _id: labId },
    { $set: { status: 'rejected', updatedAt: new Date() } }
  );
  if (result.matchedCount === 0) {
    throw new ApiError(404, 'Laboratory profile not found', 'NOT_FOUND');
  }
  res.json({ success: true });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalPatients = await userModel.collection().countDocuments({ role: 'patient' });
  const totalProviders = await userModel.collection().countDocuments({ role: 'provider' });
  const pendingApprovals = await labModel.collection().countDocuments({ status: 'pending' });
  const totalAppointments = await appointmentModel.collection().countDocuments();
  
  // Calculate total revenue from successful transactions (in kobo, convert to Naira)
  const txs = await getDb().collection('transactions').find({ status: 'success' }).toArray();
  const txTotalKobo = txs.reduce((sum, t) => sum + t.amount, 0);
  const totalRevenue = txTotalKobo / 100;

  // Generate dynamic monthly activity data (Jan - Jul 2026)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const activityData = [];

  // Group user signups by month
  const users = await userModel.collection().find().toArray();
  const appointments = await appointmentModel.collection().find().toArray();

  for (let i = 0; i < months.length; i++) {
    const monthIndex = i; // 0 for Jan, 1 for Feb, etc.
    const monthSignups = users.filter(u => {
      const date = new Date(u.createdAt);
      return date.getFullYear() === 2026 && date.getMonth() === monthIndex;
    }).length;

    const monthAppointments = appointments.filter(a => {
      const date = new Date(a.createdAt);
      return date.getFullYear() === 2026 && date.getMonth() === monthIndex;
    }).length;

    activityData.push({
      name: months[i],
      subscriptions: monthSignups,
      retention: monthAppointments,
    });
  }

  res.json({
    stats: {
      totalPatients,
      totalProviders,
      pendingApprovals,
      totalAppointments,
      totalRevenue,
      systemHealth: 100.00,
      activityData,
    }
  });
});

const listSubscriptions = asyncHandler(async (req, res) => {
  const users = await userModel.collection().find().toArray();
  const plans = await planModel.findAll();
  
  // Format users into subscription schema
  const subscriptions = users.map(user => {
    const isProvider = user.role === 'provider';
    const userPlan = (user.planId && plans.find(p => p._id.toString() === user.planId.toString()))
      || plans.find(p => p.type === (isProvider ? 'Partner' : 'Individual'))
      || { name: isProvider ? 'Enterprise Core' : 'Standard Bundle', price: isProvider ? 12450.00 : 299.00 };

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
  const { name, price, interval, type, features, nombaPlanId, transactionSplit } = req.body;
  if (!name || price === undefined || price === null) {
    throw new ApiError(400, 'Name and price are required', 'BAD_REQUEST');
  }
  const plan = await planModel.create({
    name,
    price,
    interval,
    type,
    features,
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

const { getDb } = require('../db');

module.exports = {
  listLabs,
  approveLab,
  rejectLab,
  getDashboardStats,
  listSubscriptions,
  updateSubscriptionStatus,
  listTransactions,
  listPlans,
  createPlan,
  deletePlan,
};
