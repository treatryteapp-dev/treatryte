const cron = require('node-cron');
const medicationModel = require('../models/medication.model');
const { getDb } = require('../db');
const { sendEmail } = require('../services/email.service');

function startDailyMedicationEmails() {
  // Run at 6:30 AM every day
  cron.schedule('30 6 * * *', async () => {
    console.log('Running daily medication email cron job at 6:30 AM');
    try {
      const now = new Date();
      // Find all active medications that have a providerId (meaning sent by a partner)
      const activeMeds = await medicationModel.collection().find({
        planStatus: 'active',
        providerId: { $ne: null },
        providerName: { $ne: null }
      }).toArray();

      if (activeMeds.length === 0) return;

      const usersCollection = getDb().collection('users');
      // Group by user and provider
      const notificationsToSend = new Map();

      for (const med of activeMeds) {
        // Skip if medication hasn't started or has ended
        if (med.startDate && med.startDate > now) continue;
        if (med.endDate && med.endDate < now) continue;

        const key = `${med.userId}_${med.providerName}`;
        if (!notificationsToSend.has(key)) {
          notificationsToSend.set(key, {
            userId: med.userId,
            providerName: med.providerName,
          });
        }
      }

      for (const notif of notificationsToSend.values()) {
        const user = await usersCollection.findOne({ _id: notif.userId });
        if (user && user.email) {
          const subject = 'You have a medication for today';
          const text = 'You have a medication for today, check your app.';
          const html = `
            <div style="font-family: Arial, sans-serif; color: #0b1c30; max-width: 480px;">
              <h2 style="color: #004E47;">Medication Reminder</h2>
              <p>Hi ${user.firstName || 'there'},</p>
              <p>You have a medication scheduled for today prescribed by <strong>${notif.providerName}</strong>.</p>
              <p>Please check your TreatRyte app for the dosage and schedule details, and remember to log your dose!</p>
              <p style="margin-top: 24px; color: #545f73; font-size: 13px;">- ${notif.providerName} via TreatRyte</p>
            </div>
          `;
          
          // Note: we can't fully spoof the "From" address (as it must be verified in Brevo),
          // but we can set the email subject/body clearly stating it's from the partner.
          await sendEmail({
            to: user.email,
            toName: user.firstName ? `${user.firstName} ${user.lastName}` : '',
            subject,
            html,
            text,
          });
        }
      }
    } catch (error) {
      console.error('Error running daily medication email cron:', error);
    }
  });
}

module.exports = { startDailyMedicationEmails };
