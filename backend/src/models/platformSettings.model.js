const { getDb } = require('../db');

const COLLECTION = 'platform_settings';
const SETTINGS_ID = 'platform';

function collection() {
  return getDb().collection(COLLECTION);
}

async function getSettings() {
  const doc = await collection().findOne({ _id: SETTINGS_ID });
  return {
    partnerStatusWebhookUrl: doc?.partnerStatusWebhookUrl || '',
    serviceFeeKobo: doc?.serviceFeeKobo ?? 100_000,
    // Locked bank account platform revenue withdraws to - null until an
    // admin sets one (OTP-gated, see admin.controller.js). Deliberately not
    // client-suppliable at withdrawal time so a compromised admin session
    // can't redirect a payout to an arbitrary account on the spot.
    payoutAccount: doc?.payoutAccount || null,
  };
}

async function updateSettings(updates) {
  await collection().updateOne(
    { _id: SETTINGS_ID },
    { $set: { ...updates, updatedAt: new Date() } },
    { upsert: true },
  );
  return getSettings();
}

module.exports = { COLLECTION, collection, getSettings, updateSettings };
