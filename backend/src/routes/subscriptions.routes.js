const express = require('express');

const controller = require('../controllers/subscriptions.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.post('/upgrade', validateBody(controller.upgradeSchema), controller.upgrade);
router.get('/me', controller.getCurrent);
router.post('/cancel', controller.cancel);

module.exports = router;
