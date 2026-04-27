import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },  // English (required)
    nameNe:        { type: String, default: "",    trim: true },  // Nepali
    description:   { type: String, required: true, trim: true },  // English (required)
    descriptionNe: { type: String, default: "",    trim: true },  // Nepali
    price:    { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    image:    { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
