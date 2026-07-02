const { getDb } = require('../db');

const COLLECTION = 'labs';

function collection() {
  return getDb().collection(COLLECTION);
}

function findFeatured() {
  return collection().find({ isFeatured: true }).toArray();
}

function findById(labId) {
  return collection().findOne({ _id: labId });
}

function search(query) {
  return collection()
    .find({ name: { $regex: query, $options: 'i' } })
    .toArray();
}

module.exports = { COLLECTION, collection, findFeatured, findById, search };
