const labModel = require('../models/lab.model');
const testModel = require('../models/test.model');

async function withTests(labs) {
  return Promise.all(
    labs.map(async (lab) => ({ ...lab, tests: await testModel.findByLabId(lab._id) })),
  );
}

async function getFeaturedLabs() {
  const labs = await labModel.findFeatured();
  return withTests(labs);
}

// [type] is the partner's own declared category (from the "Services
// Offered" list at registration, e.g. "Diagnostics"/"Pharmacy") - matched
// against the real `services` a lab registered with, not a guess.
async function getApprovedLabs({ type, q, state } = {}) {
  const labs = q ? await labModel.search(q) : await labModel.findApproved();
  let results = await withTests(labs);
  if (type && type !== 'all') {
    results = results.filter((lab) => (lab.services || []).includes(type));
  }
  if (state && state !== 'all') {
    results = results.filter((lab) => lab.state === state);
  }
  return results;
}

function getLabTests(labId) {
  return testModel.findByLabId(labId);
}

function getTrendingTests() {
  return testModel.findTrending();
}

module.exports = { getFeaturedLabs, getApprovedLabs, getLabTests, getTrendingTests };
