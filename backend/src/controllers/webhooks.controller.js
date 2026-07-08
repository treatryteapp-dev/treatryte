const nomba = require('../nomba');
const walletService = require('../services/wallet.service');
const settlementService = require('../services/settlement.service');
const subscriptionService = require('../services/subscription.service');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const handleNombaWebhook = asyncHandler(async (req, res) => {
  const { event_type: eventType, requestId, data } = req.body;
  const parsed = nomba.parseWebhookData(data || {});

  // Always log a compact summary of what actually arrived - this is the
  // one place that can tell us what Nomba really sent (field names, whether
  // orderReference/aliasAccountNumber is even present) instead of guessing
  // from documentation. Deliberately excludes card/bank PII (data.customer,
  // data.tokenizedCardData) - only the identifiers needed to debug routing.
  console.log('Nomba webhook received', {
    eventType,
    requestId,
    type: parsed.type,
    orderReference: parsed.orderReference,
    transferReference: parsed.transferReference,
    aliasAccountNumber: parsed.aliasAccountNumber,
    aliasAccountReference: parsed.aliasAccountReference,
    amountKobo: parsed.amountKobo,
    transactionId: parsed.transactionId,
  });

  // Temporarily log webhooks to DB so we can inspect them
  try {
    const { getDb } = require('../db');
    await getDb().collection('webhook_logs').insertOne({
      eventType,
      requestId,
      data,
      headers: req.headers,
      parsed,
      createdAt: new Date()
    });
  } catch (err) {
    console.error('Failed to log webhook', err);
  }

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
      orderReference: parsed.orderReference,
      transferReference: parsed.transferReference,
      // The exact fields fed into the HMAC, so a mismatch is diagnosable
      // without reconstructing it from the raw payload by hand.
      signedFields: {
        userId: parsed.userId,
        walletId: parsed.walletId,
        transactionId: parsed.transactionId,
        type: parsed.type,
        time: parsed.time,
        responseCode: parsed.responseCode,
      },
      hasSignatureHeader: Boolean(req.headers['nomba-signature']),
      hasTimestampHeader: Boolean(req.headers['nomba-timestamp']),
    });
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
