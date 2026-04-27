import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Professional from "../models/Professional.js";
import { notifyProfessionals, notifyUser } from "../services/notificationService.js";
import { getIO } from "../socket/index.js";

export const createBooking = async (req, res) => {
  try {
    const { customerId, serviceId, date, timeSlot, address, paymentMethod } = req.body;

    if (!customerId || !serviceId || !date || !timeSlot || !address) {
      return res.status(400).json({ message: "Missing required booking fields." });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found." });

    // Prevent duplicate active bookings for same slot/service/customer.
    const existingBooking = await Booking.findOne({
      customerId,
      serviceId,
      date,
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "You already have an active booking for this service at the selected date and time.",
        booking: existingBooking,
      });
    }

    const booking = await Booking.create({
      customerId,
      serviceId,
      date,
      timeSlot,
      address,
      amount: service.price,
      payment: { method: paymentMethod || "cash", status: "pending", transactionId: "" },
      status: "pending",
    });

    const professionals = await Professional.find({
      status: "approved",
      skills: { $in: [service.name] },
    }).select("_id");

    await notifyProfessionals(professionals, booking._id, service.name);

    try {
      getIO().to(`service_${service.name}`).emit("new_job", {
        bookingId: booking._id,
        serviceId,
        serviceName: service.name,
        date,
        timeSlot,
        address,
        amount: service.price,
      });
    } catch {
      // socket not critical - booking still created
    }

    return res.status(201).json({ message: "Booking created successfully.", booking });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create booking.", error: error.message });
  }
};

export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { professionalId } = req.body;

    if (!professionalId) {
      return res.status(400).json({ message: "professionalId is required." });
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: id, status: "pending" },
      { status: "confirmed", professionalId },
      { new: true }
    ).populate("serviceId", "name");

    if (!booking) {
      return res.status(409).json({ message: "Booking already taken or not found." });
    }

    await notifyUser(
      booking.customerId,
      booking._id,
      "Booking Confirmed",
      "Your booking has been accepted by a professional."
    );

    try {
      const io = getIO();
      io.to(`service_${booking.serviceId.name}`).emit("job_taken", { bookingId: id });
      io.to(`professional_${professionalId}`).emit("job_assigned", { bookingId: id });
    } catch {
      // socket not critical
    }

    return res.status(200).json({ message: "Booking accepted.", booking });
  } catch (error) {
    return res.status(500).json({ message: "Failed to accept booking.", error: error.message });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, status: "pending" },
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Pending booking not found." });
    }

    return res.status(200).json({ message: "Booking rejected.", booking });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject booking.", error: error.message });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, status: "confirmed" },
      { status: "completed" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Confirmed booking not found." });
    }

    if (booking.professionalId) {
      await Professional.findByIdAndUpdate(booking.professionalId, {
        $inc: { completedJobs: 1 },
      });
    }

    await notifyUser(booking.customerId, booking._id, "Job Completed", "Your service has been completed.");

    return res.status(200).json({ message: "Booking marked as completed.", booking });
  } catch (error) {
    return res.status(500).json({ message: "Failed to complete booking.", error: error.message });
  }
};

export const getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;
    const bookings = await Booking.find({ customerId })
      .populate("serviceId", "name price image duration")
      .populate("professionalId", "name phone rating")
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings, count: bookings.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch bookings.", error: error.message });
  }
};

export const getProfessionalJobs = async (req, res) => {
  try {
    const { professionalId } = req.params;

    const professional = await Professional.findById(professionalId).select("skills");
    if (!professional) return res.status(404).json({ message: "Professional not found." });

    const services = await Service.find({ name: { $in: professional.skills } }).select("_id");
    const serviceIds = services.map((s) => s._id);

    const jobs = await Booking.find({
      serviceId: { $in: serviceIds },
      status: "pending",
      professionalId: null,
    })
      .populate("serviceId", "name price image duration")
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ jobs, count: jobs.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch jobs.", error: error.message });
  }
};

export const getProfessionalTasks = async (req, res) => {
  try {
    const { professionalId } = req.params;

    const tasks = await Booking.find({
      professionalId,
      status: { $in: ["confirmed", "completed"] },
    })
      .populate("serviceId", "name price image duration")
      .populate("customerId", "name phone address")
      .sort({ createdAt: -1 });

    return res.status(200).json({ tasks, count: tasks.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks.", error: error.message });
  }
};
