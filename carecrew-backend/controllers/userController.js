import User from "../models/User.js";
import Professional from "../models/Professional.js";

const normalizeAddressInput = (address) => {
  if (!address) return null;

  if (typeof address === "string") {
    const full = address.trim();
    return full ? { fullAddress: full, lat: null, lng: null } : null;
  }

  if (typeof address === "object") {
    const full = typeof address.fullAddress === "string" ? address.fullAddress.trim() : "";
    const lat = address.lat !== undefined && address.lat !== null ? Number(address.lat) : null;
    const lng = address.lng !== undefined && address.lng !== null ? Number(address.lng) : null;
    return { fullAddress: full, lat: Number.isFinite(lat) ? lat : null, lng: Number.isFinite(lng) ? lng : null };
  }

  return null;
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    const updates = {};
    if (typeof name === "string" && name.trim()) updates.name = name.trim();

    const normalizedAddress = normalizeAddressInput(address);
    if (normalizedAddress) {
      updates.address = normalizedAddress;
      updates.profileComplete = true;
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({ message: "Profile updated.", user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile.", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const phoneNumber = req.firebaseUser?.phone_number;
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is missing in Firebase token." });
    }

    const customer = await User.findOne({ phone: phoneNumber });
    if (customer) {
      return res.status(200).json({ role: "customer", user: customer });
    }

    const professional = await Professional.findOne({ phone: phoneNumber });
    if (professional) {
      return res.status(200).json({ role: "professional", professional });
    }

    return res.status(404).json({ message: "Profile not found for this account." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const phoneNumber = req.firebaseUser?.phone_number;
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is missing in Firebase token." });
    }

    const { name, address, profileComplete } = req.body;

    const customer = await User.findOne({ phone: phoneNumber });
    if (customer) {
      if (typeof name === "string" && name.trim()) customer.name = name.trim();

      const normalizedAddress = normalizeAddressInput(address);
      if (normalizedAddress) customer.address = normalizedAddress;

      if (profileComplete === true || normalizedAddress) customer.profileComplete = true;

      await customer.save();
      return res.status(200).json({ message: "Profile updated.", role: "customer", user: customer });
    }

    const professional = await Professional.findOne({ phone: phoneNumber });
    if (professional) {
      if (typeof name === "string" && name.trim()) professional.name = name.trim();
      if (typeof address === "string") professional.address = address.trim();
      await professional.save();

      return res.status(200).json({ message: "Profile updated.", role: "professional", professional });
    }

    return res.status(404).json({ message: "Profile not found for this account." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile.", error: error.message });
  }
};
