const express = require('express');
const controller = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth');

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

module.exports = router;
