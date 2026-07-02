const { getDb } = require('../db');

const COLLECTION = 'notifications';

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ userId, type, title, body }) {
  const doc = {
    userId,
    type,
    title,
    body,
    isRead: false,
    createdAt: new Date(),
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function list(userId) {
  return collection().find({ userId }).sort({ createdAt: -1 }).toArray();
}

function markRead(userId, notificationId) {
  return collection().updateOne({ _id: notificationId, userId }, { $set: { isRead: true } });
}

function markAllRead(userId) {
  return collection().updateMany({ userId, isRead: false }, { $set: { isRead: true } });
}

module.exports = { COLLECTION, collection, create, list, markRead, markAllRead };
