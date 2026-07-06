const appointmentModel = require('../models/appointment.model');
const testModel = require('../models/test.model');
const labModel = require('../models/lab.model');
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

async function createAppointment(userId, { labId, testId, scheduledDate, scheduledTimeSlot }) {
  const test = await testModel.findById(testId);
  if (!test) {
    throw new ApiError(404, 'Test not found', 'TEST_NOT_FOUND');
  }

  const date = dateOnly(scheduledDate);
  const bookedCount = await appointmentModel.countBooked(labId, date, scheduledTimeSlot);
  if (bookedCount >= SLOT_CAPACITY) {
    throw new ApiError(409, 'This time slot is no longer available', 'SLOT_UNAVAILABLE');
  }

  const subtotal = test.price;
  const serviceFee = await getServiceFee(userId);
  const total = subtotal + serviceFee;

  return appointmentModel.create({
    userId,
    labId,
    testId,
    scheduledDate: date,
    scheduledTimeSlot,
    subtotal,
    serviceFee,
    total,
  });
}

async function payAppointment(userId, appointmentId) {
  const appointment = await appointmentModel.findById(userId, appointmentId);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found', 'APPOINTMENT_NOT_FOUND');
  }
  if (appointment.status !== 'pending_payment') {
    throw new ApiError(409, 'Appointment is not awaiting payment', 'INVALID_STATE');
  }

  const transaction = await walletService.debitImmediate(userId, {
    amountKobo: appointment.total,
    category: 'service_payment',
    description: 'Lab test appointment payment',
    metadata: { appointmentId: appointmentId.toString() },
    refs: {},
  });

  await appointmentModel.markConfirmed(appointmentId, transaction._id);

  await activityService.record(userId, {
    type: 'appointment_booked',
    title: 'Appointment Confirmed',
    subtitle: `₦${(appointment.total / 100).toLocaleString()} paid`,
    iconKey: 'event_available',
    refCollection: appointmentModel.COLLECTION,
    refId: appointmentId,
  });
  await notificationService.notify(userId, {
    type: 'appointment',
    title: 'Appointment Confirmed',
    body: 'Your booking is confirmed. Details are in your appointments list.',
  });

  const lab = await labModel.findById(appointment.labId);
  if (lab) {
    await notificationService.notify(lab.userId, {
      type: 'appointment',
      title: 'New Appointment Booked',
      body: `A patient booked and paid for a ${appointment.scheduledTimeSlot} slot on ${appointment.scheduledDate.toISOString().slice(0, 10)}.`,
    });
  }

  return { ...appointment, status: 'confirmed', transactionId: transaction._id };
}

function listAppointments(userId) {
  return appointmentModel.list(userId);
}

module.exports = { getAvailability, getServiceFee, createAppointment, payAppointment, listAppointments };
