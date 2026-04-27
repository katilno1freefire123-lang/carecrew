import mongoose from "mongoose";

const professionalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    profileImage: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [0, 0],
      },
    },
    serviceRadius: {
      type: Number,
      default: 30,
    },
    documents: {
      aadharUrl: {
        type: String,
        default: "",
      },
      panUrl: {
        type: String,
        default: "",
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    completedJobs: {
      type: Number,
      default: 0,
      min: 0,
    },
    fcmToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

professionalSchema.index({ location: "2dsphere" });

export default mongoose.model("Professional", professionalSchema);
