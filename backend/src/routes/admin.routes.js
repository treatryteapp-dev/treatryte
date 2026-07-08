const express = require('express');
const controller = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

// Protected admin routes
router.use(requireAuth);

router.get('/stats', controller.getDashboardStats);
router.get('/labs', controller.listLabs);
router.get('/labs/:id/documents', controller.listLabDocuments);
router.post('/labs/:id/approve', controller.approveLab);
router.post('/labs/:id/reject', validateBody(controller.rejectLabSchema), controller.rejectLab);
router.get('/subscriptions', controller.listSubscriptions);
router.post('/subscriptions/:id/status', controller.updateSubscriptionStatus);
router.get('/transactions', controller.listTransactions);
router.get('/plans', controller.listPlans);
router.post('/plans', controller.createPlan);
router.put('/plans/:id', controller.updatePlan);
router.delete('/plans/:id', controller.deletePlan);
router.get('/banks', controller.listBanks);
router.patch('/labs/:id/bank-details', controller.updateLabBankDetails);
router.patch('/profile', validateBody(controller.updateProfileSchema), controller.updateProfile);
router.get('/settings', controller.listPlatformSettings);
router.patch('/settings', controller.updatePlatformSettings);
router.get('/config-health', requireRole('admin'), controller.configHealth);

// Treasury (platform revenue withdrawal) - real money movement, always
// admin-role-gated regardless of what the rest of this router allows.
router.post(
  '/payout-account/lookup',
  requireRole('admin'),
  validateBody(controller.lookupAccountSchema),
  controller.lookupPayoutAccount,
);
router.get('/payout-account', requireRole('admin'), controller.getPayoutAccount);
router.post('/payout-account/request-otp', requireRole('admin'), controller.requestPayoutAccountOtp);
router.post(
  '/payout-account',
  requireRole('admin'),
  validateBody(controller.setPayoutAccountSchema),
  controller.setPayoutAccount,
);
router.get('/treasury/wallet', requireRole('admin'), controller.getTreasuryWallet);
router.post(
  '/treasury/withdraw',
  requireRole('admin'),
  validateBody(controller.withdrawPlatformRevenueSchema),
  controller.withdrawPlatformRevenue,
);

module.exports = router;
