const express = require('express');

const controller = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/send-otp', validateBody(controller.sendOtpSchema), controller.sendOtp);
router.post('/verify-otp', validateBody(controller.verifyOtpSchema), controller.verifyOtp);
router.post('/register', validateBody(controller.registerSchema), controller.register);
router.post('/login', validateBody(controller.loginSchema), controller.login);
router.post('/refresh', validateBody(controller.refreshSchema), controller.refresh);
router.post('/logout', validateBody(controller.refreshSchema), controller.logout);
router.get('/me', requireAuth, controller.me);
router.patch('/me/plan', requireAuth, validateBody(controller.updatePlanSchema), controller.updatePlan);
router.patch(
  '/me/medical-profile',
  requireAuth,
  validateBody(controller.updateMedicalProfileSchema),
  controller.updateMedicalProfile
);
router.post(
  '/me/avatar/presign',
  requireAuth,
  validateBody(controller.presignAvatarSchema),
  controller.presignAvatar
);
router.post(
  '/me/avatar/confirm',
  requireAuth,
  validateBody(controller.confirmAvatarSchema),
  controller.confirmAvatar
);
router.delete(
  '/me',
  requireAuth,
  validateBody(controller.deleteAccountSchema),
  controller.deleteAccount
);

module.exports = router;
