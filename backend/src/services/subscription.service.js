const subscriptionModel = require('../models/subscription.model');
const planModel = require('../models/plan.model');
const userModel = require('../models/user.model');
const nomba = require('../nomba');
const activityService = require('./activity.service');
const notificationService = require('./notification.service');
const { ApiError } = require('../middleware/errorHandler');
const { ROLE_TO_PLAN_TYPE } = require('../utils/planAccess');

/**
 * Free-plan switches skip Nomba entirely (direct DB update). Paid-plan
 * switches create a pending subscription + Nomba checkout order and only
 * flip the user's planId once the webhook confirms payment_success.
 */
async function initiateUpgrade(userId, planId) {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND');
  }

  const expectedType = ROLE_TO_PLAN_TYPE[user.role];
  if (!expectedType) {
    throw new ApiError(400, 'This account type cannot select a plan', 'BAD_REQUEST');
  }

  const plan = await planModel.collection().findOne({ _id: planId });
  if (!plan) {
    throw new ApiError(404, 'Plan not found', 'PLAN_NOT_FOUND');
  }
  if (plan.type !== expectedType) {
    throw new ApiError(400, `This plan is not available for ${user.role} accounts`, 'PLAN_TYPE_MISMATCH');
  }

  if (!plan.price || plan.price <= 0) {
    await userModel.update(userId, { planId: plan._id });
    return { requiresPayment: false, user: await userModel.toPublicWithAvatar(await userModel.findById(userId)) };
  }

  const amountKobo = Math.round(plan.price * 100);

  const walletService = require('./wallet.service');
  // Debit first. If it fails due to insufficient funds, the error is thrown.
  const transaction = await walletService.debitImmediate(userId, {
    amountKobo,
    category: 'subscription_payment',
    description: `Subscription to ${plan.name} plan`,
    metadata: {},
    refs: {},
  });

  const subscription = await subscriptionModel.create({
    userId,
    planId: plan._id,
    amountKobo,
    interval: plan.interval,
  });

  await subscriptionModel.activate(subscription._id);
  await userModel.update(userId, { planId: plan._id });

  const adminUser = await userModel.collection().findOne({ role: 'admin' });
  if (adminUser) {
    await walletService.creditImmediate(adminUser._id, {
      amountKobo,
      category: 'subscription_revenue',
      description: `Subscription revenue for ${plan.name} from ${user.fullName}`,
      metadata: { subscriptionId: subscription._id.toString() },
      refs: { subscriptionId: subscription._id.toString() },
    });
  }

  await activityService.record(userId, {
    type: 'subscription_upgrade',
    title: 'Plan Upgraded',
    subtitle: `Now on ${plan.name}`,
    iconKey: 'workspace_premium',
  });
  await notificationService.notify(userId, {
    type: 'subscription',
    title: 'Plan Upgraded',
    body: `Your subscription to ${plan.name} is now active.`,
  });

  return {
    requiresPayment: true,
    subscriptionId: subscription._id,
    user: await userModel.toPublicWithAvatar(await userModel.findById(userId))
  };
}

async function getCurrent(userId) {
  return subscriptionModel.findActiveByUserId(userId);
}

async function cancelSubscription(userId) {
  const subscription = await subscriptionModel.findActiveByUserId(userId);
  if (!subscription) {
    throw new ApiError(404, 'No active subscription found', 'SUBSCRIPTION_NOT_FOUND');
  }
  await subscriptionModel.cancel(subscription._id);
  return subscriptionModel.collection().findOne({ _id: subscription._id });
}



const RENEWAL_REMINDER_DAYS = 3;
const FREE_PLAN_TYPE_MATCH = { price: 0 };

/**
 * Daily cron entry point (manual-renewal v1, no card tokenization yet):
 * - Subscriptions entering their last few days: send a reminder notification
 *   with a fresh checkout link so the user can renew manually.
 * - Subscriptions already past currentPeriodEnd and still unpaid: downgrade
 *   the user to their role's free plan and cancel the subscription.
 */
async function notifyDueForRenewal(now = new Date()) {
  const windowEnd = new Date(now.getTime() + RENEWAL_REMINDER_DAYS * 24 * 60 * 60 * 1000);
  const due = await subscriptionModel.listDueForRenewal(windowEnd);

  for (const subscription of due) {
    const isExpired = subscription.currentPeriodEnd <= now;
    if (isExpired) {
      const user = await userModel.findById(subscription.userId);
      if (!user) continue;
      const freePlan = await planModel
        .collection()
        .findOne({ type: ROLE_TO_PLAN_TYPE[user.role], ...FREE_PLAN_TYPE_MATCH });

      if (freePlan) {
        await userModel.update(subscription.userId, { planId: freePlan._id });
      }
      await subscriptionModel.cancel(subscription._id);
      await notificationService.notify(subscription.userId, {
        type: 'subscription',
        title: 'Subscription Expired',
        body: 'Your plan payment was not renewed in time, so your account has moved back to the free plan.',
      });
      continue;
    }

    const daysRemaining = Math.ceil((subscription.currentPeriodEnd - now) / (24 * 60 * 60 * 1000));
    if (daysRemaining > RENEWAL_REMINDER_DAYS) continue;

    const user = await userModel.findById(subscription.userId);
    if (!user) continue;

    await notificationService.notify(subscription.userId, {
      type: 'subscription',
      title: 'Renew Your Plan',
      body: `Your plan renews in ${daysRemaining} day(s). Please ensure your wallet has sufficient funds.`,
    });
  }
}

module.exports = {
  initiateUpgrade,
  getCurrent,
  cancelSubscription,
  notifyDueForRenewal,
};
