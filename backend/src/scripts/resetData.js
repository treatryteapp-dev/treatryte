require('dotenv').config();
const { getDb, getClient } = require('../db');

/**
 * RESET SCRIPT - Wipes all user-generated data
 * Keeps: plans, admin account
 * Deletes: users (non-admin), labs, subscriptions, transactions,
 *          activities, medications, vault files, notifications, appointments
 */
async function reset() {
  const db = getDb();

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║         TREATRYTE DATA RESET IN PROGRESS         ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Delete all users EXCEPT the admin
  const usersResult = await db.collection('users').deleteMany({
    role: { $ne: 'admin' }
  });
  console.log(`✅ Users deleted (non-admin): ${usersResult.deletedCount}`);

  // Delete all lab/partner records
  const labsResult = await db.collection('labs').deleteMany({});
  console.log(`✅ Labs/Partners deleted: ${labsResult.deletedCount}`);

  // Delete all subscriptions
  const subsResult = await db.collection('subscriptions').deleteMany({});
  console.log(`✅ Subscriptions deleted: ${subsResult.deletedCount}`);

  // Delete all transactions / financial records
  const txResult = await db.collection('transactions').deleteMany({});
  console.log(`✅ Transactions deleted: ${txResult.deletedCount}`);

  // Delete all medication records
  const medsResult = await db.collection('medications').deleteMany({});
  console.log(`✅ Medication records deleted: ${medsResult.deletedCount}`);

  // Delete all vault / medical records
  const vaultResult = await db.collection('vaultFiles').deleteMany({});
  console.log(`✅ Vault files deleted: ${vaultResult.deletedCount}`);

  // Delete all activity logs
  const activitiesResult = await db.collection('activities').deleteMany({});
  console.log(`✅ Activity logs deleted: ${activitiesResult.deletedCount}`);

  // Delete all notifications
  const notifResult = await db.collection('notifications').deleteMany({});
  console.log(`✅ Notifications deleted: ${notifResult.deletedCount}`);

  // Delete all appointments
  const apptResult = await db.collection('appointments').deleteMany({});
  console.log(`✅ Appointments deleted: ${apptResult.deletedCount}`);

  // Verify plans are still intact
  const plansCount = await db.collection('plans').countDocuments();
  const adminCount = await db.collection('users').countDocuments({ role: 'admin' });

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║                  RESET COMPLETE                  ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Plans preserved:     ${String(plansCount).padEnd(27)}║`);
  console.log(`║  Admin accounts kept: ${String(adminCount).padEnd(27)}║`);
  console.log(`║  All user data: CLEARED                          ║`);
  console.log(`║  Ready for fresh registrations ✅                ║`);
  console.log('╚══════════════════════════════════════════════════╝\n');
}

reset().catch(console.error).finally(() => getClient().close());
