const medicationModel = require('../models/medication.model');
const doseLogModel = require('../models/doseLog.model');
const moodLogModel = require('../models/moodLog.model');
const activityService = require('./activity.service');
const { ApiError } = require('../middleware/errorHandler');

// Same UTC-calendar-day normalization used for appointments, to avoid
// server-timezone drift when bucketing "today"'s doses.
function todayRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function combineDateAndTime(dayStart, timeString) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(timeString.trim());
  if (!match) return new Date(dayStart);

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const result = new Date(dayStart);
  result.setUTCHours(hours, minutes, 0, 0);
  return result;
}

async function getMedications(userId) {
  const medications = await medicationModel.findActiveByUser(userId);
  return {
    medications,
    planStatus: medications.length > 0 ? 'active' : 'inactive',
  };
}

/**
 * Materializes today's dose_log rows on read: for every active medication's
 * scheduled times, ensure a row exists for today (defaulting to pending),
 * then returns the day's schedule plus the nearest upcoming pending dose.
 */
async function getTodaySchedule(userId) {
  const { start, end } = todayRange();
  const medications = await medicationModel.findActiveByUser(userId);

  for (const medication of medications) {
    for (const timeString of medication.scheduleTimes) {
      const scheduledFor = combineDateAndTime(start, timeString);
      const existing = await doseLogModel.findForMedicationOnDate(medication._id, scheduledFor);
      if (!existing) {
        await doseLogModel.create({ userId, medicationId: medication._id, scheduledFor });
      }
    }
  }

  const doseLogs = await doseLogModel.findForDay(userId, start, end);
  const medicationsById = new Map(medications.map((m) => [m._id.toString(), m]));

  const schedule = doseLogs.map((log) => {
    const medication = medicationsById.get(log.medicationId.toString());
    return {
      doseLogId: log._id,
      medicationName: medication?.name,
      dosage: medication?.dosage,
      scheduledFor: log.scheduledFor,
      status: log.status,
    };
  });

  const now = new Date();
  const nextDose = schedule
    .filter((s) => s.status === 'pending' && s.scheduledFor >= now)
    .sort((a, b) => a.scheduledFor - b.scheduledFor)[0];

  return { schedule, nextDose: nextDose || null };
}

async function logDose(userId, doseLogId) {
  const doseLog = await doseLogModel.findById(userId, doseLogId);
  if (!doseLog) {
    throw new ApiError(404, 'Dose not found', 'DOSE_NOT_FOUND');
  }

  await doseLogModel.markTaken(doseLogId);
  await activityService.record(userId, {
    type: 'medication_taken',
    title: 'Dose Logged',
    subtitle: 'Medication marked as taken',
    iconKey: 'medication',
    refCollection: doseLogModel.COLLECTION,
    refId: doseLogId,
  });

  return { ...doseLog, status: 'taken', takenAt: new Date() };
}

async function getProviders(userId) {
  const medications = await medicationModel.findActiveByUser(userId);
  const providersMap = new Map();
  for (const med of medications) {
    if (med.providerId && med.providerName) {
      providersMap.set(med.providerId.toString(), {
        id: med.providerId.toString(),
        name: med.providerName,
      });
    }
  }
  return Array.from(providersMap.values());
}

async function createPersonalMedication(userId, { name, dosage, scheduleTimes, startDate, endDate }) {
  const medication = await medicationModel.create({
    userId,
    name,
    dosage,
    scheduleTimes,
    planStatus: 'active',
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : null,
    providerId: null,
    providerName: null,
  });
  return medication;
}

async function submitMood(userId, doseLogId, { mood, note, partnerId }) {
  const doseLog = await doseLogModel.findById(userId, doseLogId);
  if (!doseLog) {
    throw new ApiError(404, 'Dose not found', 'DOSE_NOT_FOUND');
  }
  return moodLogModel.create({ userId, doseLogId, mood, note, partnerId: partnerId || null });
}

module.exports = { getMedications, getTodaySchedule, getProviders, createPersonalMedication, logDose, submitMood };
