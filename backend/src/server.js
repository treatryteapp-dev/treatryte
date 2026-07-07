const env = require('./config/env');
const app = require('./app');
const walletService = require('./services/wallet.service');

const RECONCILE_INTERVAL_MS = 5 * 60 * 1000;

app.listen(env.port, () => {
  console.log(`TreatRyte API listening on port ${env.port} (${env.nodeEnv})`);
});

// Safety net for wallet-funding webhooks that never arrive or get rejected
// (e.g. a misconfigured NOMBA_WEBHOOK_SECRET) - periodically settles any
// order still 'pending' well past the normal delivery window by checking
// Nomba directly. See walletService.reconcileStalePendingFundings.
setInterval(() => {
  walletService.reconcileStalePendingFundings().catch((error) => {
    console.error('Stale funding reconciliation sweep failed:', error.message);
  });
}, RECONCILE_INTERVAL_MS);

// Start daily cron jobs
const { startDailyMedicationEmails } = require('./jobs/dailyMedicationEmail');
startDailyMedicationEmails();
