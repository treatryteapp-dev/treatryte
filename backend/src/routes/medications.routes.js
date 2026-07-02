const express = require('express');

const controller = require('../controllers/medications.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', controller.list);
router.get('/today', controller.today);
router.post('/doses/:doseLogId/log', controller.logDose);
router.post('/doses/:doseLogId/mood', validateBody(controller.moodSchema), controller.submitMood);

module.exports = router;
