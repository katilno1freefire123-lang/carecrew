import crypto from "crypto";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { getRazorpayInstance } from "../config/razorpay.js";

export const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required." });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.payment?.method === "online" && booking.payment?.status === "completed") {
      return res.status(409).json({ message: "This booking is already paid online." });
    }

    const amountInPaise = Math.round(booking.amount * 100);

    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({ message: "Booking amount must be greater than zero." });
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${String(booking._id).slice(-10)}_${Date.now().toString().slice(-8)}`, // Razorpay receipt must be <= 40 chars
      notes: {
        bookingId: String(booking._id),
      },
    });

    await Payment.findOneAndUpdate(
      { bookingId: booking._id },
      {
        bookingId: booking._id,
        orderId: order.id,
        method: "online",
        status: "created",
        amount: booking.amount,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    booking.payment = {
      method: "online",
      status: "created",
      transactionId: "",
    };
    await booking.save();

    return res.status(201).json({
      message: "Razorpay order created.",
      order,
    });
  } catch (error) {
    const detail = error?.error?.description || error?.description || error?.message || "Unknown Razorpay error";
    return res.status(502).json({
      message: "Failed to create Razorpay order.",
      error: detail,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      method,
    } = req.body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing Razorpay verification fields." });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid Razorpay signature." });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const payment = await Payment.findOneAndUpdate(
      { bookingId: booking._id, orderId: razorpayOrderId },
      {
        bookingId: booking._id,
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        method: method || "online",
        status: "completed",
        amount: booking.amount,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    booking.payment = {
      method: "online",
      status: "completed",
      transactionId: razorpayPaymentId,
    };
    await booking.save();

    return res.status(200).json({ message: "Payment verified successfully.", payment });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify payment.", error: error.message });
  }
};

export const completeCashPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required." });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const cashTransactionId = `CASH_${booking._id}_${Date.now()}`;

    await Payment.findOneAndUpdate(
      { bookingId: booking._id, method: "cash" },
      {
        bookingId: booking._id,
        method: "cash",
        status: "completed",
        amount: booking.amount,
        paymentId: cashTransactionId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    booking.payment = {
      method: "cash",
      status: "completed",
      transactionId: cashTransactionId,
    };
    await booking.save();

    return res.status(200).json({ message: "Cash payment marked as completed.", booking });
  } catch (error) {
    return res.status(500).json({ message: "Failed to complete cash payment.", error: error.message });
  }
};
