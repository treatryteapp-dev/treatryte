const express = require('express');
const controller = require('../controllers/connections.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/', controller.listConnections);
router.get('/:id', controller.getConnectionDetail);
router.post('/:id/accept', validateBody(controller.acceptSchema), controller.acceptConnection);
router.patch('/:id/access', validateBody(controller.acceptSchema), controller.updateConnectionAccess);
router.post('/:id/decline', controller.declineConnection);

module.exports = router;
