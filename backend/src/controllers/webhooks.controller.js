const nomba = require('../nomba');
const walletService = require('../services/wallet.service');
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

  // Always 200 quickly - Nomba retries on non-200/timeout.
  res.status(200).json({ received: true });
});

module.exports = { handleNombaWebhook };
