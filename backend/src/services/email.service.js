const env = require('../config/env');

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/**
 * Sends a transactional email via Brevo. Failures are logged, not thrown -
 * a broken email provider must never block the underlying action (e.g. a
 * partner rejection) from completing.
 */
async function sendEmail({ to, toName, subject, html, text }) {
  if (!env.email.brevoApiKey || !env.email.fromAddress) {
    console.error('Email not sent - BREVO_API_KEY or EMAIL_FROM_ADDRESS is not configured', { to, subject });
    return;
  }

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': env.email.brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: env.email.fromName, email: env.email.fromAddress },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`Brevo email send failed (${response.status}): ${body}`);
    }
  } catch (error) {
    console.error('Brevo email send threw an error:', error.message);
  }
}

/**
 * Rejection always tells the partner to log back in and re-submit via the
 * app's resubmission flow, whether or not admin gave a specific reason -
 * that's the one path that gets their application back in front of admin.
 */
function partnerRejectionEmail({ facilityName, reason }) {
  const reasonHtml = reason
    ? `<p><strong>Reason for rejection:</strong><br/>${reason}</p>`
    : `<p>No specific reason was provided, but your submitted documents could not be verified as-is.</p>`;
  const reasonText = reason
    ? `Reason for rejection: ${reason}`
    : 'No specific reason was provided, but your submitted documents could not be verified as-is.';

  return {
    subject: 'Update on your TreatRyte partner application',
    html: `
      <div style="font-family: Arial, sans-serif; color: #0b1c30; max-width: 480px;">
        <h2 style="color: #004E47;">Application Update</h2>
        <p>Hi ${facilityName},</p>
        <p>Your TreatRyte partner application was <strong>not approved</strong> at this time.</p>
        ${reasonHtml}
        <p>Please log back in to the TreatRyte app - you'll be taken directly to a screen where you can
        review the reason and re-upload your verification documents for another review.</p>
        <p style="margin-top: 24px; color: #545f73; font-size: 13px;">- The TreatRyte Team</p>
      </div>
    `,
    text: `Hi ${facilityName},\n\nYour TreatRyte partner application was not approved at this time.\n\n${reasonText}\n\nPlease log back in to the TreatRyte app - you'll be taken directly to a screen where you can review the reason and re-upload your verification documents for another review.\n\n- The TreatRyte Team`,
  };
}

function otpEmail({ code }) {
  return {
    subject: 'Your TreatRyte verification code',
    html: `
      <div style="font-family: Arial, sans-serif; color: #0b1c30; max-width: 480px;">
        <h2 style="color: #004E47;">Verify your email</h2>
        <p>Use the code below to finish creating your TreatRyte account. It expires in 10 minutes.</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">${code}</p>
        <p style="color: #545f73; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="margin-top: 24px; color: #545f73; font-size: 13px;">- The TreatRyte Team</p>
      </div>
    `,
    text: `Your TreatRyte verification code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.\n\n- The TreatRyte Team`,
  };
}

module.exports = { sendEmail, partnerRejectionEmail, otpEmail };
