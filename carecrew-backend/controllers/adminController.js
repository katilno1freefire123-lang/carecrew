import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Booking from "../models/Booking.js";
import Professional from "../models/Professional.js";
import User from "../models/User.js";
import Service from "../models/Service.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ adminId: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Admin login successful.",
      token,
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login admin.", error: error.message });
  }
};

export const approveProfessional = async (req, res) => {
  try {
    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!professional) return res.status(404).json({ message: "Professional not found." });
    return res.status(200).json({ message: "Professional approved.", professional });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve professional.", error: error.message });
  }
};

export const rejectProfessional = async (req, res) => {
  try {
    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!professional) return res.status(404).json({ message: "Professional not found." });
    return res.status(200).json({ message: "Professional rejected.", professional });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject professional.", error: error.message });
  }
};

export const getAllBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "name phone")
      .populate("professionalId", "name phone skills status")
      .populate("serviceId", "name price")
      .sort({ createdAt: -1 });
    return res.status(200).json({ bookings, count: bookings.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch bookings.", error: error.message });
  }
};

export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ users, count: users.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users.", error: error.message });
  }
};

export const getAllProfessionals = async (_req, res) => {
  try {
    const professionals = await Professional.find().sort({ createdAt: -1 });
    return res.status(200).json({ professionals, count: professionals.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch professionals.", error: error.message });
  }
};

export const getDashboardStats = async (_req, res) => {
  try {
    const [totalUsers, totalProfessionals, totalBookings, pendingKYC, totalServices] = await Promise.all([
      User.countDocuments(),
      Professional.countDocuments({ status: "approved" }),
      Booking.countDocuments(),
      Professional.countDocuments({ status: "pending" }),
      Service.countDocuments({ isActive: true }),
    ]);

    const recentBookings = await Booking.find()
      .populate("customerId", "name")
      .populate("serviceId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      stats: { totalUsers, totalProfessionals, totalBookings, pendingKYC, totalServices },
      recentBookings,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard stats.", error: error.message });
  }
};
