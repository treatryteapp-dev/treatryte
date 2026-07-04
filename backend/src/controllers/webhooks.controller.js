const nomba = require('../nomba');
const walletService = require('../services/wallet.service');
const settlementService = require('../services/settlement.service');
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
    throw new ApiError(401, 'Invalid webhook signature', 'INVALID_SIGNATURE');
  }

  await walletService.handleNombaWebhook(eventType, data);
  // A payout_* transferReference belongs to either a user withdrawal or a
  // partner settlement - both handlers no-op when the ref isn't theirs.
  if (eventType === 'payout_success' || eventType === 'payout_failed' || eventType === 'payout_refund') {
    await settlementService.handleSettlementWebhook(eventType, data);
  }

  // Always 200 quickly - Nomba retries on non-200/timeout.
  res.status(200).json({ received: true });
});

module.exports = { handleNombaWebhook };
