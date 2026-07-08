require('../config/env');
const { getClient } = require('../db');
const settlementService = require('../services/settlement.service');
const walletService = require('../services/wallet.service');
const appointmentModel = require('../models/appointment.model');
const userModel = require('../models/user.model');
const labModel = require('../models/lab.model');

async function migrate() {
  console.log('Starting legacy settlement migration...');

  try {
    const outstanding = await settlementService.computeOutstanding();
    console.log(`Found ${outstanding.length} partners with outstanding balances.`);

    let totalMigrated = 0;
    for (const entry of outstanding) {
      if (entry.netAmountKobo <= 0) continue;

      const lab = await labModel.findById(entry.lab._id);
      if (!lab) continue;
      
      const partnerUser = await userModel.findById(lab.userId);
      if (!partnerUser) continue;

      console.log(`Migrating ${entry.netAmountKobo} Kobo to Partner ${partnerUser.fullName}...`);

      // Credit the partner's wallet
      await walletService.creditImmediate(partnerUser._id, {
        amountKobo: entry.netAmountKobo,
        category: 'appointment_earning',
        description: 'Legacy settlement migration',
        metadata: { appointmentIds: entry.appointmentIds },
        refs: {},
      });

      // Credit Admin wallet with the platform fees
      const adminUser = await userModel.collection().findOne({ role: 'admin' });
      if (adminUser && entry.platformFeeKobo > 0) {
        await walletService.creditImmediate(adminUser._id, {
          amountKobo: entry.platformFeeKobo,
          category: 'platform_fee',
          description: 'Legacy settlement platform fee migration',
          metadata: { appointmentIds: entry.appointmentIds },
          refs: {},
        });
      }

      // Mark appointments as settled (with a dummy settlement ID or just random)
      const dummySettlementId = entry.appointmentIds[0]; // just needs to be non-null
      await appointmentModel.markSettled(entry.appointmentIds, dummySettlementId);

      totalMigrated += entry.netAmountKobo;
    }

    console.log(`Migration complete. Total partner earnings migrated: ₦${totalMigrated / 100}`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
