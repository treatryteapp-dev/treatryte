const { getDb } = require('../db');

const COLLECTION = 'users';

function collection() {
  return getDb().collection(COLLECTION);
}

function findByEmail(email) {
  return collection().findOne({ email: email.toLowerCase() });
}

function findById(id) {
  return collection().findOne({ _id: id });
}

async function create({ fullName, dateOfBirth, gender, address, email, passwordHash, role, planId }) {
  const { ObjectId } = require('mongodb');
  const now = new Date();
  const doc = {
    fullName,
    dateOfBirth: new Date(dateOfBirth),
    gender,
    address,
    email: email.toLowerCase(),
    passwordHash,
    role: role || 'patient',
    planId: planId ? new ObjectId(planId) : null,
    nombaCustomerId: null,
    biometricLockEnabled: false,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function toPublic(user) {
  if (!user) return null;
  return {
    id: user._id,
    fullName: user.fullName,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
    email: user.email,
    role: user.role,
    biometricLockEnabled: user.biometricLockEnabled,
  };
}

module.exports = { COLLECTION, collection, findByEmail, findById, create, toPublic };
