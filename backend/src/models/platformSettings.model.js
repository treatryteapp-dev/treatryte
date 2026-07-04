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
