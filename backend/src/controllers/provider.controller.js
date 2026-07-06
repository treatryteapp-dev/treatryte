const { z } = require('zod');
const { ObjectId } = require('mongodb');

const labModel = require('../models/lab.model');
const testModel = require('../models/test.model');
const appointmentModel = require('../models/appointment.model');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const vaultFileModel = require('../models/vaultFile.model');
const prescriptionModel = require('../models/prescription.model');
const notificationService = require('../services/notification.service');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid id', 'INVALID_ID');
  }
  return new ObjectId(id);
}

async function getProviderLab(userId) {
  const lab = await labModel.findByUserId(userId);
  if (!lab) {
    throw new ApiError(404, 'Provider laboratory profile not found', 'LAB_NOT_FOUND');
  }
  return lab;
}

const getProfile = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const user = await userModel.findById(req.userId);
  const plan = user?.planId ? await planModel.collection().findOne({ _id: user.planId }) : null;
  res.json({ lab, plan });
});

// After a rejected partner re-uploads verification documents, this puts
// their application back in front of admin instead of leaving it stuck as
// 'rejected' forever.
const resubmitApplication = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  if (lab.status !== 'rejected') {
    throw new ApiError(400, 'Only a rejected application can be resubmitted', 'INVALID_STATE');
  }

  await labModel.update(lab._id, { status: 'pending', rejectionReason: null });
  const updated = await labModel.findById(lab._id);
  res.json({ lab: updated });
});

const listServices = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const services = await testModel.findByLabId(lab._id);
  res.json({ services });
});

const createServiceSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
  category: z.string().min(1),
});

const createService = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const service = await testModel.create({
    labId: lab._id,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
  });
  res.status(201).json({ service });
});

const updateServiceSchema = z.object({
  name: z.string().optional(),
  price: z.number().int().positive().optional(),
  category: z.string().optional(),
});

const updateService = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const testId = parseObjectId(req.params.id);
  const service = await testModel.findById(testId);
  if (!service) {
    throw new ApiError(404, 'Service not found', 'SERVICE_NOT_FOUND');
  }
  if (service.labId.toString() !== lab._id.toString()) {
    throw new ApiError(403, 'Unauthorized access to service', 'FORBIDDEN');
  }

  await testModel.update(testId, req.body);
  res.json({ success: true });
});

const deleteService = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const testId = parseObjectId(req.params.id);
  const service = await testModel.findById(testId);
  if (!service) {
    throw new ApiError(404, 'Service not found', 'SERVICE_NOT_FOUND');
  }
  if (service.labId.toString() !== lab._id.toString()) {
    throw new ApiError(403, 'Unauthorized access to service', 'FORBIDDEN');
  }

  await testModel.deleteById(testId);
  res.json({ success: true });
});

async function joinAppointmentDetails(appointments) {
  const patientIds = [...new Set(appointments.map((a) => a.userId.toString()))];

  const patients = await userModel.collection().find({ _id: { $in: patientIds.map((id) => new ObjectId(id)) } }).toArray();
  const patientsById = new Map(patients.map((p) => [p._id.toString(), p]));

  return appointments.map((a) => ({
    ...a,
    patientName: patientsById.get(a.userId.toString())?.fullName || 'Unknown Patient',
    // Service names are a snapshot taken at booking time (appointment.items),
    // not re-joined against the live tests collection - a partner editing or
    // deleting a service afterward must not change historical appointments.
    serviceType: a.items?.length ? a.items.map((item) => item.name).join(', ') : null,
  }));
}

const listAppointments = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const appointments = await appointmentModel.listByLabId(lab._id);
  res.json({ appointments: await joinAppointmentDetails(appointments) });
});

async function getOwnedAppointment(lab, appointmentId) {
  const appointment = await appointmentModel.collection().findOne({ _id: appointmentId });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found', 'APPOINTMENT_NOT_FOUND');
  }
  if (appointment.labId.toString() !== lab._id.toString()) {
    throw new ApiError(403, 'Unauthorized access to appointment', 'FORBIDDEN');
  }
  return appointment;
}

const checkInAppointment = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const appointmentId = parseObjectId(req.params.id);
  await getOwnedAppointment(lab, appointmentId);

  await appointmentModel.updateStatus(appointmentId, 'checked_in');
  res.json({ success: true });
});

const rescheduleSchema = z.object({
  scheduledDate: z.string().min(1),
  scheduledTimeSlot: z.string().min(1),
});

const rescheduleAppointment = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const appointmentId = parseObjectId(req.params.id);
  const appointment = await getOwnedAppointment(lab, appointmentId);

  await appointmentModel.updateSchedule(appointmentId, req.body);
  await notificationService.notify(appointment.userId, {
    type: 'appointment',
    title: 'Appointment Rescheduled',
    body: `Your appointment has been rescheduled to ${req.body.scheduledDate} (${req.body.scheduledTimeSlot}).`,
  });
  res.json({ success: true });
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const appointmentId = parseObjectId(req.params.id);
  const appointment = await getOwnedAppointment(lab, appointmentId);

  await appointmentModel.updateStatus(appointmentId, 'cancelled');
  await notificationService.notify(appointment.userId, {
    type: 'appointment',
    title: 'Appointment Cancelled',
    body: 'Your appointment has been cancelled by the provider.',
  });
  res.json({ success: true });
});

const listPatients = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const distinctPatients = await appointmentModel.listDistinctPatientsByLabId(lab._id);
  const patientIds = distinctPatients.map((p) => p._id);
  const users = await userModel.collection().find({ _id: { $in: patientIds } }).toArray();
  const usersById = new Map(users.map((u) => [u._id.toString(), u]));

  const patients = distinctPatients
    .map((p) => {
      const user = usersById.get(p._id.toString());
      if (!user) return null;
      return {
        id: user._id,
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        lastVisit: p.lastVisit,
      };
    })
    .filter(Boolean);

  res.json({ patients });
});

async function getOwnedPatient(lab, patientId) {
  const hasAppointment = await appointmentModel.collection().findOne({ labId: lab._id, userId: patientId });
  if (!hasAppointment) {
    throw new ApiError(403, 'This patient has no appointment history with your lab', 'FORBIDDEN');
  }
  const patient = await userModel.findById(patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found', 'PATIENT_NOT_FOUND');
  }
  return patient;
}

const getPatientDetail = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const patientId = parseObjectId(req.params.id);
  const patient = await getOwnedPatient(lab, patientId);

  const [reports, prescriptions] = await Promise.all([
    vaultFileModel.findByLabIdAndUserId(lab._id, patientId),
    prescriptionModel.findByLabIdAndPatientId(lab._id, patientId),
  ]);

  res.json({
    patient: {
      id: patient._id,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      medicalProfile: patient.medicalProfile || { bloodGroup: null, allergies: [], conditions: [] },
    },
    reports,
    prescriptions,
  });
});

const addPrescriptionSchema = z.object({
  medicineName: z.string().min(1),
  dosage: z.string().min(1),
  duration: z.string().min(1),
  notes: z.string().optional(),
});

const addPrescription = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const patientId = parseObjectId(req.params.id);
  await getOwnedPatient(lab, patientId);

  const prescription = await prescriptionModel.create({
    labId: lab._id,
    patientId,
    medicineName: req.body.medicineName,
    dosage: req.body.dosage,
    duration: req.body.duration,
    notes: req.body.notes,
  });

  await notificationService.notify(patientId, {
    type: 'prescription',
    title: 'New Prescription',
    body: `${lab.name} added a new prescription: ${req.body.medicineName}.`,
  });

  res.status(201).json({ prescription });
});

const invitePatientSchema = z.object({
  email: z.string().email(),
});

const invitePatient = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const invitee = await userModel.findByEmail(req.body.email);
  if (!invitee) {
    throw new ApiError(404, 'No TreatRyte account found for this email', 'USER_NOT_FOUND');
  }

  await notificationService.notify(invitee._id, {
    type: 'invite',
    title: 'Provider Invitation',
    body: `${lab.name} has invited you to connect and share your medical records.`,
  });

  res.json({ success: true });
});

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  rescheduleSchema,
  addPrescriptionSchema,
  invitePatientSchema,
  getProfile,
  resubmitApplication,
  listServices,
  createService,
  updateService,
  deleteService,
  listAppointments,
  checkInAppointment,
  rescheduleAppointment,
  cancelAppointment,
  listPatients,
  getPatientDetail,
  addPrescription,
  invitePatient,
};
