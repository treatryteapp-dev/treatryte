const express = require('express');

const controller = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validateBody(controller.registerSchema), controller.register);
router.post('/login', validateBody(controller.loginSchema), controller.login);
router.post('/refresh', validateBody(controller.refreshSchema), controller.refresh);
router.post('/logout', validateBody(controller.refreshSchema), controller.logout);
router.get('/me', requireAuth, controller.me);
router.patch('/me/plan', requireAuth, validateBody(controller.updatePlanSchema), controller.updatePlan);

module.exports = router;
