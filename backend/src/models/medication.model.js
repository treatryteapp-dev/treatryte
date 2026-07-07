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
  let mappedTimes = scheduleTimes || ['8:00 AM', '2:00 PM', '8:00 PM'];
  if (Array.isArray(mappedTimes)) {
    mappedTimes = mappedTimes.flatMap(t => {
      if (typeof t !== 'string') return ['09:00 AM'];
      if (t === '1 time daily') return ['09:00 AM'];
      if (t === '2 times daily') return ['09:00 AM', '09:00 PM'];
      if (t === '3 times daily') return ['08:00 AM', '02:00 PM', '08:00 PM'];
      if (t === '4 times daily') return ['08:00 AM', '12:00 PM', '04:00 PM', '08:00 PM'];
      if (t === 'As needed') return ['09:00 AM'];
      return [t];
    });
  }
  const doc = {
    userId,
    name,
    dosage,
    scheduleTimes: mappedTimes,
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
