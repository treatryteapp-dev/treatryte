const env = require('./config/env');
const app = require('./app');
const walletService = require('./services/wallet.service');

const RECONCILE_INTERVAL_MS = 5 * 60 * 1000;

app.listen(env.port, () => {
  console.log(`TreatRyte API listening on port ${env.port} (${env.nodeEnv})`);
});

// Auto-migrate legacy settlements on startup. This script is idempotent
// because it only processes 'unsettled' appointments and marks them 'settled'.
require('./scripts/migrateSettlements');

// Start daily cron jobs
const { startDailyMedicationEmails } = require('./jobs/dailyMedicationEmail');
startDailyMedicationEmails();
