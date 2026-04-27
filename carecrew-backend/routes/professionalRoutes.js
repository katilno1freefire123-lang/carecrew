import express from "express";
import Professional from "../models/Professional.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);
    if (!professional) return res.status(404).json({ message: "Professional not found." });
    return res.status(200).json({ professional });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch professional.", error: error.message });
  }
});

router.put("/:id/toggle-online", async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);
    if (!professional) return res.status(404).json({ message: "Professional not found." });
    professional.isOnline = !professional.isOnline;
    await professional.save();
    return res.status(200).json({ message: `Now ${professional.isOnline ? "online" : "offline"}.`, isOnline: professional.isOnline });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle status.", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, experience, location } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (experience !== undefined) updates.experience = Number(experience);
    if (location) updates.location = location;

    const professional = await Professional.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!professional) return res.status(404).json({ message: "Professional not found." });
    return res.status(200).json({ message: "Profile updated.", professional });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile.", error: error.message });
  }
});

export default router;
