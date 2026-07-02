const { getDb } = require('../db');

const COLLECTION = 'tests';

function collection() {
  return getDb().collection(COLLECTION);
}

function findByLabId(labId) {
  return collection().find({ labId }).toArray();
}

function findTrending() {
  return collection().find({ isTrending: true }).toArray();
}

function findById(testId) {
  return collection().findOne({ _id: testId });
}

module.exports = { COLLECTION, collection, findByLabId, findTrending, findById };
