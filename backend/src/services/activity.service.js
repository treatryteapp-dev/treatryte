const activityModel = require('../models/activity.model');

function record(userId, { type, title, subtitle, iconKey, refCollection, refId }) {
  return activityModel.create({ userId, type, title, subtitle, iconKey, refCollection, refId });
}

function listRecent(userId, limit) {
  return activityModel.listRecent(userId, limit);
}

module.exports = { record, listRecent };
