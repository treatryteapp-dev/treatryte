const express = require('express');
const controller = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

// Protected admin routes
router.use(requireAuth);

router.get('/stats', controller.getDashboardStats);
router.get('/labs', controller.listLabs);
router.post('/labs/:id/approve', controller.approveLab);
router.post('/labs/:id/reject', controller.rejectLab);
router.get('/subscriptions', controller.listSubscriptions);
router.post('/subscriptions/:id/status', controller.updateSubscriptionStatus);
router.get('/transactions', controller.listTransactions);
router.get('/plans', controller.listPlans);
router.post('/plans', controller.createPlan);
router.delete('/plans/:id', controller.deletePlan);
router.get('/settlements', controller.listSettlements);
router.post('/settlements/trigger', controller.triggerSettlements);
router.get('/banks', controller.listBanks);
router.patch('/labs/:id/bank-details', controller.updateLabBankDetails);
router.patch('/profile', validateBody(controller.updateProfileSchema), controller.updateProfile);
router.get('/settings', controller.listPlatformSettings);
router.patch('/settings', controller.updatePlatformSettings);

module.exports = router;
