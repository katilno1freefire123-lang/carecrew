import Service from "../models/Service.js";
import fs from "fs/promises";
import { getCloudinary } from "../config/cloudinary.js";

const uploadServiceImageToCloudinary = async (file) => {
  if (!file?.path) return "";

  const cloudinary = getCloudinary();
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "carecrew/services",
      resource_type: "image",
    });
    return result.secure_url || "";
  } finally {
    await fs.unlink(file.path).catch(() => {});
  }
};

export const createService = async (req, res) => {
  try {
    const { name, nameNe, description, descriptionNe, price, duration } = req.body;

    if (!name || !description || !price || !duration) {
      return res.status(400).json({ message: "name, description, price, duration are required." });
    }

    const uploadedImageUrl = req.file ? await uploadServiceImageToCloudinary(req.file) : "";
    const image = uploadedImageUrl || req.body.image || "";

    const service = await Service.create({
      name:          name.trim(),
      nameNe:        nameNe?.trim() || "",
      description:   description.trim(),
      descriptionNe: descriptionNe?.trim() || "",
      price:    Number(price),
      duration: Number(duration),
      image,
    });

    return res.status(201).json({ message: "Service created.", service });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create service.", error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = await uploadServiceImageToCloudinary(req.file);
    if (updates.price)    updates.price    = Number(updates.price);
    if (updates.duration) updates.duration = Number(updates.duration);

    // Ensure Nepali fields are trimmed if provided
    if (updates.nameNe)        updates.nameNe        = updates.nameNe.trim();
    if (updates.descriptionNe) updates.descriptionNe = updates.descriptionNe.trim();

    const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!service) return res.status(404).json({ message: "Service not found." });

    return res.status(200).json({ message: "Service updated.", service });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update service.", error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found." });
    return res.status(200).json({ message: "Service deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete service.", error: error.message });
  }
};

export const getAllServices = async (_req, res) => {
  try {
    // Return all fields — frontend picks nameNe/descriptionNe or name/description based on lang
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ services, count: services.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch services.", error: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found." });
    return res.status(200).json({ service });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch service.", error: error.message });
  }
};
