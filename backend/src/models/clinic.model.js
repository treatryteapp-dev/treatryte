const { getDb } = require('../db');

const COLLECTION = 'clinics';

function collection() {
  return getDb().collection(COLLECTION);
}

function list(type) {
  const query = type && type !== 'all' ? { type } : {};
  return collection().find(query).toArray();
}

function search(query) {
  return collection()
    .find({ name: { $regex: query, $options: 'i' } })
    .toArray();
}

module.exports = { COLLECTION, collection, list, search };
