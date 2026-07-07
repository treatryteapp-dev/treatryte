const { getDb } = require('../db');

const COLLECTION = 'medications';

function collection() {
  return getDb().collection(COLLECTION);
}

function findActiveByUser(userId) {
  return collection().find({ userId, planStatus: 'active' }).toArray();
}

async function create({ userId, name, dosage, scheduleTimes, planStatus, startDate, endDate }) {
  const now = new Date();
  const doc = {
    userId,
    name,
    dosage,
    scheduleTimes: scheduleTimes || ['8:00 AM', '2:00 PM', '8:00 PM'],
    planStatus: planStatus || 'active',
    startDate: startDate || now,
    endDate: endDate || null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

module.exports = { COLLECTION, collection, findActiveByUser, create };
