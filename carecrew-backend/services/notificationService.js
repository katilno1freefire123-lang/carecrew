import Notification from "../models/Notification.js";

export const notifyProfessionals = async (professionals, bookingId, serviceName) => {
  if (!professionals.length) return;

  const notifications = professionals.map((pro) => ({
    recipientId: pro._id,
    recipientType: "professional",
    bookingId,
    title: "New Job Available",
    message: `New booking request for ${serviceName}. Tap to accept.`,
  }));

  await Notification.insertMany(notifications);
};

export const notifyUser = async (userId, bookingId, title, message) => {
  await Notification.create({
    recipientId: userId,
    recipientType: "user",
    bookingId,
    title,
    message,
  });
};
