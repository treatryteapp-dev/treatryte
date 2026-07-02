const { ObjectId } = require('mongodb');

const directoryService = require('../services/directory.service');
const { asyncHandler } = require('../middleware/asyncHandler');

const labs = asyncHandler(async (req, res) => {
  if (req.query.featured === 'true') {
    return res.json({ labs: await directoryService.getFeaturedLabs() });
  }
  res.json({ labs: [] });
});

const labTests = asyncHandler(async (req, res) => {
  const tests = await directoryService.getLabTests(new ObjectId(req.params.labId));
  res.json({ tests });
});

const trendingTests = asyncHandler(async (req, res) => {
  const tests = await directoryService.getTrendingTests();
  res.json({ tests });
});

const clinics = asyncHandler(async (req, res) => {
  const results = await directoryService.getClinics(req.query.type);
  res.json({ clinics: results });
});

const search = asyncHandler(async (req, res) => {
  const results = await directoryService.search(req.query.q || '');
  res.json(results);
});

module.exports = { labs, labTests, trendingTests, clinics, search };
