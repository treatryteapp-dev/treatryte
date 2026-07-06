const express = require('express');
const controller = require('../controllers/provider.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('provider'));

router.get('/profile', controller.getProfile);

router.get('/services', controller.listServices);
router.post('/services', validateBody(controller.createServiceSchema), controller.createService);
router.put('/services/:id', validateBody(controller.updateServiceSchema), controller.updateService);
router.delete('/services/:id', controller.deleteService);

router.get('/appointments', controller.listAppointments);
router.post('/appointments/:id/checkin', controller.checkInAppointment);
router.post('/appointments/:id/reschedule', validateBody(controller.rescheduleSchema), controller.rescheduleAppointment);
router.post('/appointments/:id/cancel', controller.cancelAppointment);

router.get('/patients', controller.listPatients);
router.post('/patients/invite', validateBody(controller.invitePatientSchema), controller.invitePatient);
router.get('/patients/:id', controller.getPatientDetail);
router.post('/patients/:id/prescriptions', validateBody(controller.addPrescriptionSchema), controller.addPrescription);

module.exports = router;
