const activityService = require('../services/activity.service');
const { asyncHandler } = require('../middleware/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const activities = await activityService.listRecent(req.userId, limit);
  res.json({ activities });
});

module.exports = { list };
