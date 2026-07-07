const appointmentModel = require('../models/appointment.model');
const testModel = require('../models/test.model');
const labModel = require('../models/lab.model');
const userModel = require('../models/user.model');
const patientModel = require('../models/patient.model');
const subscriptionModel = require('../models/subscription.model');
const platformSettingsModel = require('../models/platformSettings.model');
const walletService = require('./wallet.service');
const activityService = require('./activity.service');
const notificationService = require('./notification.service');
const { ApiError } = require('../middleware/errorHandler');

const SLOT_CAPACITY = 5;
const TIME_SLOTS = ['09:00 AM', '10:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM'];
const AVAILABILITY_DAYS = 4;

// Normalizes to a UTC calendar-day boundary so date buckets are consistent
// regardless of server local timezone - mixing local-time construction with
// toISOString()/date-only string parsing (which is always UTC) causes an
// off-by-one-day drift whenever the server's local offset isn't UTC+0.
function dateOnly(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function getAvailability(labId) {
  const days = [];
  for (let i = 0; i < AVAILABILITY_DAYS; i++) {
    const date = dateOnly(new Date());
    date.setDate(date.getDate() + i);

    const slots = await Promise.all(
      TIME_SLOTS.map(async (time) => {
        const bookedCount = await appointmentModel.countBooked(labId, date, time);
        return { time, available: bookedCount < SLOT_CAPACITY };
      }),
    );

    days.push({ date: date.toISOString().slice(0, 10), slots });
  }
  return days;
}

// Subscribers pay the lab's actual listed price with no markup - the
// service fee only applies to patients without an active subscription, and
// its amount is admin-configurable rather than hardcoded.
async function getServiceFee(userId) {
  const activeSubscription = await subscriptionModel.findActiveByUserId(userId);
  if (activeSubscription) return 0;
  const settings = await platformSettingsModel.getSettings();
  return settings.serviceFeeKobo;
}

// A patient can book several of a partner's services for the same slot as
// one appointment (one service fee, one payment) instead of repeating the
// whole flow per service. Payment via wallet is synchronous, so booking and
// paying happen as a single atomic step - the wallet is charged *before*
// the appointment is ever inserted, so a declined/insufficient-funds
// payment never leaves a slot reserved or a "pending" booking sitting in
// the partner's queue that was never actually paid for.
async function createAppointment(userId, { labId, testIds, scheduledDate, scheduledTimeSlot }) {
  if (!testIds.length) {
    throw new ApiError(400, 'Select at least one service', 'NO_SERVICES_SELECTED');
  }

  const tests = await Promise.all(testIds.map((id) => testModel.findById(id)));
  if (tests.some((test) => !test)) {
    throw new ApiError(404, 'One or more selected services could not be found', 'TEST_NOT_FOUND');
  }
  if (tests.some((test) => test.labId.toString() !== labId.toString())) {
    throw new ApiError(400, 'Selected services must all belong to the same partner', 'SERVICE_LAB_MISMATCH');
  }

  const date = dateOnly(scheduledDate);
  const bookedCount = await appointmentModel.countBooked(labId, date, scheduledTimeSlot);
  if (bookedCount >= SLOT_CAPACITY) {
    throw new ApiError(409, 'This time slot is no longer available', 'SLOT_UNAVAILABLE');
  }

  const items = tests.map((test) => ({ testId: test._id, name: test.name, price: test.price }));
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const serviceFee = await getServiceFee(userId);
  const total = subtotal + serviceFee;

  // Debit first - if this throws (insufficient funds), nothing below runs
  // and no appointment document is ever created.
  const transaction = await walletService.debitImmediate(userId, {
    amountKobo: total,
    category: 'service_payment',
    description: 'Lab test appointment payment',
    metadata: {},
    refs: {},
  });

  const appointment = await appointmentModel.create({
    userId,
    labId,
    items,
    scheduledDate: date,
    scheduledTimeSlot,
    subtotal,
    serviceFee,
    total,
    status: 'confirmed',
    transactionId: transaction._id,
  });

  await activityService.record(userId, {
    type: 'appointment_booked',
    title: 'Appointment Confirmed',
    subtitle: `₦${(total / 100).toLocaleString()} paid`,
    iconKey: 'event_available',
    refCollection: appointmentModel.COLLECTION,
    refId: appointment._id,
  });
  await notificationService.notify(userId, {
    type: 'appointment',
    title: 'Appointment Confirmed',
    body: 'Your booking is confirmed. Details are in your appointments list.',
  });

  const lab = await labModel.findById(labId);
  if (lab) {
    await notificationService.notify(lab.userId, {
      type: 'appointment',
      title: 'New Appointment Booked',
      body: `A patient booked and paid for a ${scheduledTimeSlot} slot on ${date.toISOString().slice(0, 10)}.`,
    });

    // Keeps the partner's patient directory in sync automatically - a real
    // booking is exactly as much reason to appear there as a manually
    // created walk-in record.
    const patientUser = await userModel.findById(userId);
    if (patientUser) {
      await patientModel.findOrCreateForUser(labId, patientUser);
    }
  }

  return appointment;
}

// Appointment docs only store labId - batch-join lab names the same way
// vault.service.js's enrichFiles() joins vault files to their source lab,
// so the patient-side list has something displayable without an extra
// round trip per appointment.
async function listAppointments(userId) {
  const appointments = await appointmentModel.list(userId);
  if (appointments.length === 0) return [];

  const labIds = appointments.map((a) => a.labId).filter(Boolean);
  const labs = await labModel.collection().find({ _id: { $in: labIds } }).toArray();
  const labsById = new Map(labs.map((l) => [l._id.toString(), l]));

  return appointments.map((appointment) => ({
    ...appointment,
    labName: labsById.get(appointment.labId?.toString())?.name || null,
  }));
}

module.exports = { getAvailability, getServiceFee, createAppointment, listAppointments };
