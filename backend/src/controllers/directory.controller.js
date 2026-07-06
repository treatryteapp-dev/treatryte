const { ObjectId } = require('mongodb');

const directoryService = require('../services/directory.service');
const { asyncHandler } = require('../middleware/asyncHandler');

const labs = asyncHandler(async (req, res) => {
  if (req.query.featured === 'true') {
    return res.json({ labs: await directoryService.getFeaturedLabs() });
  }
  res.json({
    labs: await directoryService.getApprovedLabs({
      type: req.query.type,
      q: req.query.q,
      state: req.query.state,
    }),
  });
});

const labTests = asyncHandler(async (req, res) => {
  const tests = await directoryService.getLabTests(new ObjectId(req.params.labId));
  res.json({ tests });
});

const trendingTests = asyncHandler(async (req, res) => {
  const tests = await directoryService.getTrendingTests();
  res.json({ tests });
});

module.exports = { labs, labTests, trendingTests };
