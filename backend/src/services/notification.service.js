const notificationModel = require('../models/notification.model');

function notify(userId, { type, title, body }) {
  return notificationModel.create({ userId, type, title, body });
}

function list(userId) {
  return notificationModel.list(userId);
}

function markRead(userId, notificationId) {
  return notificationModel.markRead(userId, notificationId);
}

function markAllRead(userId) {
  return notificationModel.markAllRead(userId);
}

module.exports = { notify, list, markRead, markAllRead };
