const express = require('express');
const controller = require('../controllers/provider.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/profile', controller.getProfile);

router.get('/services', controller.listServices);
router.post('/services', validateBody(controller.createServiceSchema), controller.createService);
router.put('/services/:id', validateBody(controller.updateServiceSchema), controller.updateService);
router.delete('/services/:id', controller.deleteService);

router.get('/appointments', controller.listAppointments);
router.post('/appointments/:id/checkin', controller.checkInAppointment);

module.exports = router;
