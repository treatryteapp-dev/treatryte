const { ObjectId } = require('mongodb');

const notificationService = require('../services/notification.service');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid id', 'INVALID_ID');
  }
  return new ObjectId(id);
}

function startOfDay(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return d;
}

const list = asyncHandler(async (req, res) => {
  const notifications = await notificationService.list(req.userId);

  if (req.query.grouped !== 'true') {
    return res.json({ notifications });
  }

  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const grouped = { today: [], yesterday: [], earlier: [] };
  for (const notification of notifications) {
    const day = startOfDay(notification.createdAt);
    if (day.getTime() === today.getTime()) grouped.today.push(notification);
    else if (day.getTime() === yesterday.getTime()) grouped.yesterday.push(notification);
    else grouped.earlier.push(notification);
  }
  res.json(grouped);
});

const markRead = asyncHandler(async (req, res) => {
  await notificationService.markRead(req.userId, parseObjectId(req.params.id));
  res.status(204).send();
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.userId);
  res.status(204).send();
});

module.exports = { list, markRead, markAllRead };
