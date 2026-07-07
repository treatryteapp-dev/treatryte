const crypto = require('crypto');
const env = require('./config/env');

let tokenCache = null; // { accessToken, expiresAt: Date }
let bankListCache = null; // { banks, cachedAt: Date }
const BANK_LIST_TTL_MS = 60 * 60 * 1000; // 1 hour

async function issueAccessToken() {
  const res = await fetch(`${env.nomba.baseUrl}/v1/auth/token/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accountId: env.nomba.accountId,
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: env.nomba.clientId,
      client_secret: env.nomba.clientSecret,
    }),
  });

  const json = await res.json();
  if (!res.ok || json.code !== '00') {
    throw new Error(`Nomba token issue failed: ${json.description || res.status}`);
  }

  tokenCache = {
    accessToken: json.data.access_token,
    expiresAt: new Date(json.data.expiresAt),
  };
  return tokenCache.accessToken;
}

async function getAccessToken() {
  const isFresh = tokenCache && tokenCache.expiresAt.getTime() - Date.now() > 60_000;
  if (isFresh) return tokenCache.accessToken;
  return issueAccessToken();
}

/**
 * Wraps every Nomba API call with auth headers and a single forced-refresh
 * retry on 401, so token expiry never surfaces as a caller-visible error.
 */
async function nombaFetch(path, { method = 'GET', body, forceRefresh = false } = {}) {
  const token = forceRefresh ? await issueAccessToken() : await getAccessToken();

  const res = await fetch(`${env.nomba.baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      accountId: env.nomba.accountId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !forceRefresh) {
    return nombaFetch(path, { method, body, forceRefresh: true });
  }

  const json = await res.json();
  return { status: res.status, ok: res.ok, json };
}

async function createCheckoutOrder({ amountKobo, customerEmail, customerId, orderReference, callbackUrl }) {
  const { json, ok } = await nombaFetch('/v1/checkout/order', {
    method: 'POST',
    body: {
      order: {
        orderReference,
        customerId,
        callbackUrl,
        customerEmail,
        amount: amountKobo / 100,
        currency: 'NGN',
        // Without this, funds settle to the default/parent account instead
        // of the intended sub-account - this was never being sent before.
        ...(env.nomba.subAccountId ? { accountId: env.nomba.subAccountId } : {}),
      },
    },
  });
  if (!ok || json.code !== '00') {
    throw new Error(`Nomba checkout order failed: ${json.description || 'unknown error'}`);
  }
  return json.data; // { checkoutLink, orderReference }
}

/**
 * Creates a permanent dedicated virtual account for a customer (a real
 * bank account number that always routes to us) - the reliable alternative
 * to Nomba Checkout's inline pay-by-transfer option, which generates a
 * short-lived dynamic account that stops being reconcilable to an order
 * once its window expires. No BVN sent - it inherits the parent account's.
 */
async function createVirtualAccount({ accountRef, accountName }) {
  const { json, ok } = await nombaFetch('/v1/accounts/virtual', {
    method: 'POST',
    body: { accountRef, accountName, currency: 'NGN' },
  });
  if (!ok || json.code !== '00') {
    throw new Error(`Nomba virtual account creation failed: ${json.description || 'unknown error'}`);
  }
  return json.data; // { bankAccountNumber, bankAccountName, bankName, accountRef }
}

/**
 * Looks up a checkout order's real status directly from Nomba, independent
 * of whether their webhook ever reached us - the safety net for a missed,
 * rejected (e.g. bad signature), or simply undelivered webhook.
 *
 * Deliberately NOT /v1/transactions/accounts/single - verified against
 * Nomba's sandbox that it does not actually filter by orderReference at all
 * (it returned a real, unrelated transaction for a reference confirmed not
 * to exist). /v1/checkout/transaction correctly returns "not found" for the
 * same case, so that's the only endpoint used here.
 *
 * Returns null if Nomba has no record of this order (not yet paid, or
 * doesn't exist).
 */
async function verifyTransaction({ orderReference }) {
  const { json, ok } = await nombaFetch(
    `/v1/checkout/transaction?idType=ORDER_REFERENCE&id=${encodeURIComponent(orderReference)}`
  );
  if (!ok || json.code !== '00' || !json.data?.success) {
    return null;
  }
  return {
    success: json.data.transactionDetails?.statusCode === 'PAYMENT SUCCESSFUL',
    transactionId: json.data.transactionDetails?.paymentReference || json.data.order?.orderId,
    raw: json.data,
  };
}

async function transferToBank({ amountKobo, accountNumber, bankCode, accountName, senderName, merchantTxRef, narration }) {
  const { json, status } = await nombaFetch('/v2/transfers/bank', {
    method: 'POST',
    body: {
      amount: amountKobo / 100,
      accountNumber,
      bankCode,
      accountName,
      senderName,
      merchantTxRef,
      narration,
    },
  });

  // 200 = settled immediately, 201 = accepted, final status arrives via webhook.
  if (status !== 200 && status !== 201) {
    const message = json.errors ? json.errors.join(', ') : json.description || 'unknown error';
    throw new Error(`Nomba transfer failed: ${message}`);
  }
  return { ...json.data, pending: status === 201 };
}

async function listBanks() {
  const isFresh = bankListCache && Date.now() - bankListCache.cachedAt < BANK_LIST_TTL_MS;
  if (isFresh) return bankListCache.banks;

  const { json, ok } = await nombaFetch('/v1/transfers/banks');
  if (!ok || json.code !== '00') {
    throw new Error(`Nomba bank list failed: ${json.description || 'unknown error'}`);
  }
  bankListCache = { banks: json.data, cachedAt: Date.now() };
  return bankListCache.banks;
}

async function lookupBankAccount({ accountNumber, bankCode }) {
  const { json, ok } = await nombaFetch('/v1/transfers/bank/lookup', {
    method: 'POST',
    body: { accountNumber, bankCode },
  });
  if (!ok || json.code !== '00') {
    throw new Error(`Nomba account lookup failed: ${json.description || 'unknown error'}`);
  }
  return json.data; // { accountNumber, accountName }
}

/**
 * Nomba's webhook `data` object nests everything under `data.merchant`,
 * `data.transaction`, and (for checkout-order payments only) `data.order` -
 * confirmed against their signature-verification, checkout-order, and
 * virtual-account docs, plus a live round-trip test. There is no flat
 * `data.orderReference`/`data.transactionId`/etc - reading those directly
 * silently gives undefined for every field, which is exactly what every
 * webhook consumer in this codebase was doing. This is the single place
 * that knows the real field paths, so every consumer reads through it
 * instead of re-deriving (and re-breaking) it.
 */
function parseWebhookData(data) {
  return {
    userId: data.merchant?.userId,
    walletId: data.merchant?.walletId,
    transactionId: data.transaction?.transactionId,
    type: data.transaction?.type,
    time: data.transaction?.time,
    // A literal string "null" (not JSON null/absent) must sign as empty -
    // a real gotcha other Nomba integrations have hit; guard it here so it
    // can only ever be fixed in one place.
    responseCode:
      data.transaction?.responseCode === 'null' ? '' : data.transaction?.responseCode,
    // Only present for checkout-order payments (card, or pay-by-transfer
    // through the checkout page) - absent for dedicated-virtual-account
    // transfers (data.transaction.type === 'vact_transfer').
    orderReference: data.order?.orderReference,
    // The merchantTxRef we generate and send when initiating a payout -
    // used to match a payout_* webhook back to the original transfer.
    transferReference: data.transaction?.merchantTxRef,
    amountKobo:
      data.transaction?.transactionAmount != null
        ? Math.round(data.transaction.transactionAmount * 100)
        : null,
    // Identifies which dedicated virtual account received a vact_transfer.
    // aliasAccountReference in Nomba's sample payloads looks like an
    // internal session id ("122320250916PM"), not the accountRef we send
    // when creating the account - aliasAccountNumber (the literal bank
    // account number) is the unambiguous one, since that's exactly what we
    // already store as wallet.virtualAccountNumber.
    aliasAccountReference: data.transaction?.aliasAccountReference,
    aliasAccountNumber: data.transaction?.aliasAccountNumber,
  };
}

/**
 * Recomputes the HMAC-SHA256 signature Nomba expects and compares it to the
 * `nomba-signature` header using a timing-safe comparison.
 */
function verifyWebhookSignature({ eventType, requestId, data, headers }) {
  const signature = headers['nomba-signature'];
  const timestamp = headers['nomba-timestamp'];
  if (!signature || !timestamp || !env.nomba.webhookSecret) {
    return false;
  }

  const parsed = parseWebhookData(data);
  const payloadString = [
    eventType,
    requestId,
    parsed.userId || '',
    parsed.walletId || '',
    parsed.transactionId || '',
    parsed.type || '',
    parsed.time || '',
    parsed.responseCode || '',
    timestamp,
  ].join(':');

  const expected = crypto
    .createHmac('sha256', env.nomba.webhookSecret)
    .update(payloadString)
    .digest('base64');

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

module.exports = {
  getAccessToken,
  createCheckoutOrder,
  createVirtualAccount,
  verifyTransaction,
  transferToBank,
  listBanks,
  lookupBankAccount,
  verifyWebhookSignature,
  parseWebhookData,
};
