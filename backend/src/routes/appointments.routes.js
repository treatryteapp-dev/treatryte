const express = require('express');

const controller = require('../controllers/appointments.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/availability', controller.availability);
router.get('/', controller.list);
router.post('/', validateBody(controller.createSchema), controller.create);
router.post('/:id/pay', controller.pay);

module.exports = router;
