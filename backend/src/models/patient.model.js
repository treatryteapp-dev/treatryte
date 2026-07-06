const crypto = require('crypto');
const { getDb } = require('../db');

const COLLECTION = 'patients';

function collection() {
  return getDb().collection(COLLECTION);
}

function generateCode() {
  return `P-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/**
 * A partner-scoped patient directory entry. Unlike `users`, this doesn't
 * require a real TreatRyte account - a partner can create one for a walk-in
 * patient with just a name + email, and [linkedUserId] is only set if that
 * email happens to match a real registered account. This is what every
 * medical record/prescription attaches to going forward, instead of
 * requiring appointment history with a real user.
 */
async function create({ labId, fullName, email, dateOfBirth, gender, linkedUserId }) {
  const now = new Date();
  const doc = {
    labId,
    patientCode: generateCode(),
    fullName,
    email: email.toLowerCase(),
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    gender: gender || null,
    linkedUserId: linkedUserId || null,
    lastVisitAt: now,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByLabId(labId) {
  return collection().find({ labId }).sort({ lastVisitAt: -1 }).toArray();
}

function findById(labId, patientId) {
  return collection().findOne({ _id: patientId, labId });
}

function findByLabIdAndEmail(labId, email) {
  return collection().findOne({ labId, email: email.toLowerCase() });
}

function findByLabIdAndUserId(labId, userId) {
  return collection().findOne({ labId, linkedUserId: userId });
}

function touchLastVisit(patientId) {
  return collection().updateOne({ _id: patientId }, { $set: { lastVisitAt: new Date(), updatedAt: new Date() } });
}

/**
 * Finds this lab's directory entry for a real registered user, creating one
 * (and backfilling name/email/dob/gender from their account) if this is
 * their first visit - this is what keeps a real patient's directory entry
 * in sync automatically every time they book, with no manual step needed.
 */
async function findOrCreateForUser(labId, user) {
  const existing = await findByLabIdAndUserId(labId, user._id);
  if (existing) {
    await touchLastVisit(existing._id);
    return existing;
  }

  const byEmail = await findByLabIdAndEmail(labId, user.email);
  if (byEmail) {
    await collection().updateOne(
      { _id: byEmail._id },
      { $set: { linkedUserId: user._id, lastVisitAt: new Date(), updatedAt: new Date() } },
    );
    return { ...byEmail, linkedUserId: user._id };
  }

  return create({
    labId,
    fullName: user.fullName,
    email: user.email,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    linkedUserId: user._id,
  });
}

module.exports = {
  COLLECTION,
  collection,
  create,
  findByLabId,
  findById,
  findByLabIdAndEmail,
  findByLabIdAndUserId,
  findOrCreateForUser,
  touchLastVisit,
};
