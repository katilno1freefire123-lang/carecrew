import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      default: null,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    address: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      fullAddress: { type: String, required: true, trim: true },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    payment: {
      method: {
        type: String,
        enum: ["online", "cash"],
        default: "cash",
      },
      status: {
        type: String,
        default: "pending",
      },
      transactionId: {
        type: String,
        default: "",
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("Booking", bookingSchema);
