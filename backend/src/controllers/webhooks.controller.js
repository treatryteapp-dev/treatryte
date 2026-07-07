const nomba = require('../nomba');
const walletService = require('../services/wallet.service');
const settlementService = require('../services/settlement.service');
const subscriptionService = require('../services/subscription.service');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const handleNombaWebhook = asyncHandler(async (req, res) => {
  const { event_type: eventType, requestId, data } = req.body;

  const isValid = nomba.verifyWebhookSignature({
    eventType,
    requestId,
    data,
    headers: req.headers,
  });
  if (!isValid) {
    // Loud on purpose - a rejected webhook here silently leaves the
    // matching wallet-funding/payout order stuck 'pending' until the
    // background reconciliation sweep catches it, so this needs to be
    // visible in logs/alerts immediately, not discovered via a user report.
    console.error('Nomba webhook signature verification failed', {
      eventType,
      requestId,
      orderReference: data?.orderReference,
      transferReference: data?.transferReference,
    });
    throw new ApiError(401, 'Invalid webhook signature', 'INVALID_SIGNATURE');
  }

  await walletService.handleNombaWebhook(eventType, data);
  // A payout_* transferReference belongs to either a user withdrawal or a
  // partner settlement - both handlers no-op when the ref isn't theirs.
  if (eventType === 'payout_success' || eventType === 'payout_failed' || eventType === 'payout_refund') {
    await settlementService.handleSettlementWebhook(eventType, data);
  }
  // A payment_* orderReference belongs to either a wallet-funding order
  // (handled above) or a subscription upgrade - no-ops if the ref isn't theirs.
  if (eventType === 'payment_success' || eventType === 'payment_failed' || eventType === 'payment_reversal') {
    await subscriptionService.handleSubscriptionWebhook(eventType, data);
  }

  // Always 200 quickly - Nomba retries on non-200/timeout.
  res.status(200).json({ received: true });
});

module.exports = { handleNombaWebhook };
