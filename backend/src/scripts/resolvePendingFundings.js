require('../config/env');
const { getClient } = require('../db');
const transactionModel = require('../models/transaction.model');
const activityService = require('../services/activity.service');
const notificationService = require('../services/notification.service');
const nomba = require('../nomba');
const env = require('../config/env');

async function nombaFetch(path, options = {}) {
  // We can just use the exported getAccessToken
  const token = await nomba.getAccessToken();
  const url = `${env.nomba.env === 'live' ? 'https://api.nomba.com' : 'https://api.sandbox.nomba.com'}${path}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      accountId: env.nomba.accountId,
      ...options.headers,
    },
  });

  const rawText = await res.text();
  let json = {};
  if (rawText) {
    try {
      json = JSON.parse(rawText);
    } catch {
      // ignore
    }
  }

  return { status: res.status, ok: res.ok, json };
}

async function verifyTransaction(orderReference) {
  const { json, ok } = await nombaFetch(
    `/v1/checkout/transaction?idType=ORDER_REFERENCE&id=${encodeURIComponent(orderReference)}`
  );
  if (!ok || json.code !== '00' || !json.data?.success) {
    return null;
  }
  return {
    success: json.data.transactionDetails?.statusCode === 'PAYMENT SUCCESSFUL',
    transactionId: json.data.transactionDetails?.paymentReference || json.data.order?.orderId,
  };
}

async function resolvePendingFundings() {
  console.log('Checking for pending wallet funding transactions...');
  const client = getClient();
  await client.connect();

  try {
    const staleFundings = await transactionModel.findStalePendingFundings({
      olderThanMs: 0, 
      newerThanMs: 30 * 24 * 60 * 60 * 1000, // Look back 30 days
    });

    console.log(`Found ${staleFundings.length} pending checkout-based fundings.`);

    let resolvedCount = 0;
    for (const pending of staleFundings) {
      if (!pending.nombaOrderReference) continue;
      
      console.log(`Verifying orderReference: ${pending.nombaOrderReference}...`);
      const result = await verifyTransaction(pending.nombaOrderReference);

      if (result && result.success) {
        console.log(`Payment successful for orderReference: ${pending.nombaOrderReference}. Crediting wallet...`);
        
        // Finalize transaction (which increments wallet balance)
        await transactionModel.finalizePendingCredit(pending._id, result.transactionId);
        
        await activityService.record(pending.userId, {
          type: 'wallet_funding',
          title: 'Wallet Funded',
          subtitle: `₦${(pending.amount / 100).toLocaleString()} credited`,
          iconKey: 'account_balance_wallet',
        });

        await notificationService.notify(pending.userId, {
          type: 'wallet',
          title: 'Wallet Funded',
          body: `₦${(pending.amount / 100).toLocaleString()} has been credited to your wallet (via recovered checkout).`,
        });

        resolvedCount++;
      } else {
        console.log(`Order ${pending.nombaOrderReference} is not paid successfully (status: ${result ? result.success : 'not found'}).`);
      }
    }

    console.log(`Finished resolving pending transactions. Successfully credited ${resolvedCount} wallets.`);
  } catch (error) {
    console.error('Error resolving pending fundings:', error);
  } finally {
    const client = getClient();
    await client.close();
  }
}

resolvePendingFundings();
