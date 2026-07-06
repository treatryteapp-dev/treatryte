const { z } = require('zod');
const { ObjectId } = require('mongodb');

const labModel = require('../models/lab.model');
const testModel = require('../models/test.model');
const appointmentModel = require('../models/appointment.model');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const vaultFileModel = require('../models/vaultFile.model');
const prescriptionModel = require('../models/prescription.model');
const patientModel = require('../models/patient.model');
const medicalRecordModel = require('../models/medicalRecord.model');
const connectionModel = require('../models/connection.model');
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

function toPartnerPatient(patient) {
  return {
    id: patient._id,
    patientCode: patient.patientCode,
    fullName: patient.fullName,
    email: patient.email,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    lastVisit: patient.lastVisitAt,
  };
}

const listPatients = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const patients = await patientModel.findByLabId(lab._id);
  res.json({ patients: patients.map(toPartnerPatient) });
});

async function getOwnedPatient(lab, patientId) {
  const patient = await patientModel.findById(lab._id, patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found', 'PATIENT_NOT_FOUND');
  }
  return patient;
}

// A patient directory entry only has a real medicalProfile/vault reports if
// it's linked to a real registered account - a walk-in patient with no
// account has neither, since there's nowhere for that data to live.
const createPatientSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

const createPatient = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const email = req.body.email.toLowerCase();

  const existing = await patientModel.findByLabIdAndEmail(lab._id, email);
  if (existing) {
    return res.json({ patient: toPartnerPatient(existing) });
  }

  const linkedUser = await userModel.findByEmail(email);
  const patient = await patientModel.create({
    labId: lab._id,
    fullName: req.body.fullName,
    email,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    linkedUserId: linkedUser ? linkedUser._id : null,
  });

  res.status(201).json({ patient: toPartnerPatient(patient) });
});

const getPatientDetail = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const patientId = parseObjectId(req.params.id);
  const patient = await getOwnedPatient(lab, patientId);

  const linkedUser = patient.linkedUserId ? await userModel.findById(patient.linkedUserId) : null;

  // A patient's vault is only visible here once they've explicitly accepted
  // a share request, and only for the folders (or "all") they granted -
  // being a registered patient of this lab is not enough on its own.
  let reports = [];
  if (linkedUser) {
    const connection = await connectionModel.findByLabAndPatient(lab._id, patient.linkedUserId);
    if (connection?.status === 'accepted') {
      reports = connection.shareAll
        ? await vaultFileModel.findByUserId(patient.linkedUserId)
        : await vaultFileModel.findByUserIdAndFolderIds(patient.linkedUserId, connection.sharedFolderIds || []);
    }
  }

  const [prescriptions, medicalRecords] = await Promise.all([
    prescriptionModel.findByLabIdAndPatientId(lab._id, patientId),
    medicalRecordModel.findByLabIdAndPatientId(lab._id, patientId),
  ]);

  res.json({
    patient: {
      id: patient._id,
      patientCode: patient.patientCode,
      fullName: patient.fullName,
      email: patient.email,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      medicalProfile: linkedUser?.medicalProfile || { bloodGroup: null, allergies: [], conditions: [] },
    },
    reports,
    prescriptions,
    medicalRecords,
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
  const patient = await getOwnedPatient(lab, patientId);

  const prescription = await prescriptionModel.create({
    labId: lab._id,
    patientId,
    medicineName: req.body.medicineName,
    dosage: req.body.dosage,
    duration: req.body.duration,
    notes: req.body.notes,
  });

  if (patient.linkedUserId) {
    await notificationService.notify(patient.linkedUserId, {
      type: 'prescription',
      title: 'New Prescription',
      body: `${lab.name} added a new prescription: ${req.body.medicineName}.`,
    });
  }

  res.status(201).json({ prescription });
});

const issueMedicalRecordSchema = z.object({
  visitType: z.string().min(1),
  notes: z.string().optional(),
});

const issueMedicalRecord = asyncHandler(async (req, res) => {
  const lab = await getProviderLab(req.userId);
  const patientId = parseObjectId(req.params.id);
  const patient = await getOwnedPatient(lab, patientId);

  const record = await medicalRecordModel.create({
    labId: lab._id,
    patientId,
    visitType: req.body.visitType,
    notes: req.body.notes,
  });

  if (patient.linkedUserId) {
    await notificationService.notify(patient.linkedUserId, {
      type: 'medical_record',
      title: 'New Medical Record',
      body: `${lab.name} added a new record: ${req.body.visitType}.`,
    });
  }

  res.status(201).json({ record });
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

  // Idempotent - re-inviting an already-pending/accepted patient doesn't
  // create a duplicate connection.
  await connectionModel.findOrCreatePending(lab._id, invitee._id);

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
  createPatientSchema,
  issueMedicalRecordSchema,
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
  createPatient,
  getPatientDetail,
  addPrescription,
  issueMedicalRecord,
  invitePatient,
};
