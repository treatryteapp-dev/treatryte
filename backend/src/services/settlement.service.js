const appointmentModel = require('../models/appointment.model');
const labModel = require('../models/lab.model');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const settlementModel = require('../models/settlement.model');
const nomba = require('../nomba');

/**
 * Groups unsettled confirmed appointments by lab and computes what each lab
 * is owed, net of the platform fee from their subscription plan's
 * transactionSplit. `payoutReady` is false until an admin has recorded a
 * verified bankCode/accountName for the lab (see updateLabBankDetails).
 */
async function computeOutstanding() {
  const appointments = await appointmentModel.listUnsettledConfirmed();

  const byLab = new Map();
  for (const appt of appointments) {
    const key = appt.labId.toString();
    if (!byLab.has(key)) {
      byLab.set(key, { labId: appt.labId, appointmentIds: [], grossAmountKobo: 0 });
    }
    const entry = byLab.get(key);
    entry.appointmentIds.push(appt._id);
    entry.grossAmountKobo += appt.subtotal;
  }

  const plans = await planModel.findAll();
  const results = [];

  for (const entry of byLab.values()) {
    const lab = await labModel.findById(entry.labId);
    if (!lab) continue;

    const owner = await userModel.findById(lab.userId);
    const plan = owner?.planId && plans.find(p => p._id.toString() === owner.planId.toString());
    const splitPercent = plan ? plan.transactionSplit : 0;

    const platformFeeKobo = Math.round(entry.grossAmountKobo * (splitPercent / 100));
    const netAmountKobo = entry.grossAmountKobo - platformFeeKobo;
    const bankDetails = lab.bankDetails || {};

    results.push({
      lab: { _id: lab._id, name: lab.name, bankDetails },
      appointmentIds: entry.appointmentIds,
      grossAmountKobo: entry.grossAmountKobo,
      platformFeeKobo,
      netAmountKobo,
      payoutReady: !!(bankDetails.bankCode && bankDetails.accountNumber && bankDetails.accountName),
    });
  }

  return results;
}

/**
 * Runs a payout for every payout-ready outstanding balance. Entries missing
 * verified bank details are skipped (surfaced to the admin via `payoutReady`
 * on the outstanding list) rather than attempted and failed.
 */
async function triggerBatch() {
  const outstanding = await computeOutstanding();
  const summary = { processed: 0, failed: 0, skipped: 0, totalAmountKobo: 0 };

  for (const entry of outstanding) {
    if (!entry.payoutReady) {
      summary.skipped++;
      continue;
    }

    const settlement = await settlementModel.create({
      labId: entry.lab._id,
      appointmentIds: entry.appointmentIds,
      grossAmountKobo: entry.grossAmountKobo,
      platformFeeKobo: entry.platformFeeKobo,
      netAmountKobo: entry.netAmountKobo,
      bankSnapshot: entry.lab.bankDetails,
    });
    const merchantTxRef = settlement._id.toString();

    try {
      const transfer = await nomba.transferToBank({
        amountKobo: entry.netAmountKobo,
        accountNumber: entry.lab.bankDetails.accountNumber,
        bankCode: entry.lab.bankDetails.bankCode,
        accountName: entry.lab.bankDetails.accountName,
        senderName: 'TreatRyte',
        merchantTxRef,
        narration: 'TreatRyte partner settlement',
      });

      await settlementModel.collection().updateOne(
        { _id: settlement._id },
        {
          $set: {
            status: transfer.pending ? 'pending' : 'completed',
            nombaTransferRef: merchantTxRef,
            settledAt: transfer.pending ? null : new Date(),
            updatedAt: new Date(),
          },
        },
      );
      await appointmentModel.markSettled(entry.appointmentIds, settlement._id);

      summary.processed++;
      summary.totalAmountKobo += entry.netAmountKobo;
    } catch (error) {
      // 202/pending vs outright rejection both leave appointments unsettled
      // above; an outright throw here means Nomba rejected the transfer, so
      // mark it failed and let the next batch retry from scratch.
      await settlementModel.collection().updateOne(
        { _id: settlement._id },
        { $set: { status: 'failed', updatedAt: new Date() } },
      );
      summary.failed++;
    }
  }

  return summary;
}

/**
 * Mirrors wallet.service.handleNombaWebhook's payout_* handling, but
 * resolves against the settlements collection. Safe no-op when the
 * transferReference doesn't belong to a settlement (e.g. it's a user
 * withdrawal instead) - the caller invokes both handlers for every
 * payout_* event.
 */
async function handleSettlementWebhook(eventType, rawData) {
  const data = nomba.parseWebhookData(rawData);
  switch (eventType) {
    case 'payout_success': {
      const existing = await settlementModel.findByNombaTransferRef(data.transferReference);
      if (!existing || existing.status === 'completed') return;
      await settlementModel.collection().updateOne(
        { _id: existing._id },
        { $set: { status: 'completed', settledAt: new Date(), updatedAt: new Date() } },
      );
      return;
    }
    case 'payout_failed':
    case 'payout_refund': {
      const existing = await settlementModel.findByNombaTransferRef(data.transferReference);
      if (!existing || existing.status === 'failed') return;

      await settlementModel.collection().updateOne(
        { _id: existing._id },
        { $set: { status: 'failed', updatedAt: new Date() } },
      );
      // Free the appointments back up so the next batch retries them.
      await appointmentModel.collection().updateMany(
        { settlementId: existing._id },
        { $set: { settlementId: null, updatedAt: new Date() } },
      );
      return;
    }
    default:
      return;
  }
}

module.exports = {
  computeOutstanding,
  triggerBatch,
  handleSettlementWebhook,
};
