const { getDb } = require('../db');

const COLLECTION = 'medications';

function collection() {
  return getDb().collection(COLLECTION);
}

function findActiveByUser(userId) {
  return collection().find({ userId, planStatus: 'active' }).toArray();
}

module.exports = { COLLECTION, collection, findActiveByUser };
