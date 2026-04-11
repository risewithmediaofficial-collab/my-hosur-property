const Notification = require("../models/Notification");

const myNotifications = async (req, res) => {
  const items = await Notification.find({ recipientId: req.user._id })
    .populate("senderId", "name role")
    .sort("-createdAt")
    .limit(200);

  return res.json({ items });
};

const markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  if (String(notification.recipientId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  notification.readAt = notification.readAt || new Date();
  await notification.save();
  return res.json({ item: notification, message: "Notification marked as read" });
};

module.exports = {
  myNotifications,
  markAsRead,
};
