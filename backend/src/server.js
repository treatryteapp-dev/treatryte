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

// Safety net for dedicated virtual account transfers whose webhook never
// arrives - these have no pending row to sweep, so this scans Nomba's own
// ledger directly instead. See walletService.reconcileVirtualAccountTransfers.
setInterval(() => {
  walletService.reconcileVirtualAccountTransfers().catch((error) => {
    console.error('Virtual account transfer reconciliation sweep failed:', error.message);
  });
}, RECONCILE_INTERVAL_MS);

// Safety net for outbound bank transfers (withdrawals - shared by patient,
// partner, and admin wallets) whose payout webhook never arrives. See
// walletService.reconcilePendingPayouts.
setInterval(() => {
  walletService.reconcilePendingPayouts().catch((error) => {
    console.error('Payout reconciliation sweep failed:', error.message);
  });
}, RECONCILE_INTERVAL_MS);

// Start daily cron jobs
const { startDailyMedicationEmails } = require('./jobs/dailyMedicationEmail');
startDailyMedicationEmails();
