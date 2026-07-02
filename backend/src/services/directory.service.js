const labModel = require('../models/lab.model');
const testModel = require('../models/test.model');
const clinicModel = require('../models/clinic.model');

async function getFeaturedLabs() {
  const labs = await labModel.findFeatured();
  return Promise.all(
    labs.map(async (lab) => ({ ...lab, tests: await testModel.findByLabId(lab._id) })),
  );
}

function getLabTests(labId) {
  return testModel.findByLabId(labId);
}

function getTrendingTests() {
  return testModel.findTrending();
}

function getClinics(type) {
  return clinicModel.list(type);
}

async function search(query) {
  const [labs, clinics] = await Promise.all([labModel.search(query), clinicModel.search(query)]);
  return { labs, clinics };
}

module.exports = { getFeaturedLabs, getLabTests, getTrendingTests, getClinics, search };
