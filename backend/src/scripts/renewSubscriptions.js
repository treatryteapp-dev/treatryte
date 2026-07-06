require('dotenv').config();
const { getClient } = require('../db');
const subscriptionService = require('../services/subscription.service');

// Daily cron entry point (Railway/OS cron). Sends renewal-reminder
// notifications with a fresh Nomba checkout link for subscriptions nearing
// currentPeriodEnd, and auto-downgrades to the free plan any subscription
// that has already expired unpaid. See subscription.service.js for the
// manual-renewal v1 design (tokenized auto-renewal is a documented follow-up).
async function main() {
  await subscriptionService.notifyDueForRenewal();
  console.log('Subscription renewal sweep complete.');
}

main()
  .catch((error) => {
    console.error('Subscription renewal sweep failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getClient().close();
  });
