const express = require('express');
const controller = require('../controllers/connections.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', controller.listConnections);
router.post('/:id/accept', validateBody(controller.acceptSchema), controller.acceptConnection);
router.post('/:id/decline', controller.declineConnection);

module.exports = router;
