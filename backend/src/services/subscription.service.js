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
  const subscription = await subscriptionModel.create({
    userId,
    planId: plan._id,
    amountKobo,
    interval: plan.interval,
  });

  const order = await nomba.createCheckoutOrder({
    amountKobo,
    customerEmail: user.email,
    customerId: userId.toString(),
    orderReference: subscription._id.toString(),
  });

  await subscriptionModel.collection().updateOne(
    { _id: subscription._id },
    { $set: { nombaOrderReference: order.orderReference, updatedAt: new Date() } },
  );

  return {
    requiresPayment: true,
    checkoutLink: order.checkoutLink,
    orderReference: order.orderReference,
    subscriptionId: subscription._id,
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

/**
 * Matched by orderReference against the subscriptions collection - no-ops
 * if the reference belongs to a wallet-funding transaction instead (handled
 * separately by walletService).
 */
async function handleSubscriptionWebhook(eventType, data) {
  const subscription = await subscriptionModel.findByNombaOrderReference(data.orderReference);
  if (!subscription) return;

  switch (eventType) {
    case 'payment_success': {
      if (subscription.status !== 'pending_payment') return; // already handled
      const activated = await subscriptionModel.activate(subscription._id);
      await userModel.update(subscription.userId, { planId: subscription.planId });

      const plan = await planModel.collection().findOne({ _id: subscription.planId });
      await activityService.record(subscription.userId, {
        type: 'subscription_upgrade',
        title: 'Plan Upgraded',
        subtitle: plan ? `Now on ${plan.name}` : 'Plan upgraded',
        iconKey: 'workspace_premium',
      });
      await notificationService.notify(subscription.userId, {
        type: 'subscription',
        title: 'Plan Upgraded',
        body: plan
          ? `Your subscription to ${plan.name} is now active.`
          : 'Your plan upgrade is now active.',
      });
      return activated;
    }
    case 'payment_failed':
    case 'payment_reversal': {
      if (subscription.status !== 'pending_payment') return;
      await subscriptionModel.markPastDue(subscription._id);
      return;
    }
    default:
      return;
  }
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

    const order = await nomba.createCheckoutOrder({
      amountKobo: subscription.amountKobo,
      customerEmail: user.email,
      customerId: subscription.userId.toString(),
      orderReference: subscription._id.toString(),
    });

    await notificationService.notify(subscription.userId, {
      type: 'subscription',
      title: 'Renew Your Plan',
      body: `Your plan renews in ${daysRemaining} day(s). Tap to complete payment: ${order.checkoutLink}`,
    });
  }
}

module.exports = {
  initiateUpgrade,
  getCurrent,
  cancelSubscription,
  handleSubscriptionWebhook,
  notifyDueForRenewal,
};
