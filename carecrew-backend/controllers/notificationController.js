import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  try {
    const { recipientId, recipientType } = req.query;

    if (!recipientId || !recipientType) {
      return res.status(400).json({ message: "recipientId and recipientType are required." });
    }

    const notifications = await Notification.find({ recipientId, recipientType })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ notifications, count: notifications.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch notifications.", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    return res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update notification.", error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { recipientId, recipientType } = req.body;
    await Notification.updateMany({ recipientId, recipientType, isRead: false }, { isRead: true });
    return res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update notifications.", error: error.message });
  }
};
