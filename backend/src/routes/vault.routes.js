const express = require('express');

const controller = require('../controllers/vault.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/categories', controller.categories);
router.get('/stats', controller.stats);
router.get('/files', controller.listFiles);
router.get('/files/:fileId', controller.getFile);
router.post('/files/presign', validateBody(controller.presignSchema), controller.presign);
router.post('/files/:fileId/confirm', controller.confirm);
router.patch('/biometric-lock', validateBody(controller.biometricLockSchema), controller.biometricLock);

module.exports = router;
