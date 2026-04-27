import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      default: "",
      index: true,
    },
    paymentId: {
      type: String,
      default: "",
    },
    signature: {
      type: String,
      default: "",
    },
    method: {
      type: String,
      enum: ["online", "cash"],
      required: true,
    },
    status: {
      type: String,
      required: true,
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

export default mongoose.model("Payment", paymentSchema);