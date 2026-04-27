import User from "../models/User.js";
import Professional from "../models/Professional.js";

export const customerLogin = async (req, res) => {
  try {
    const { phone_number: phoneNumber, name, uid } = req.firebaseUser;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is missing in Firebase token." });
    }

    let user = await User.findOne({ phone: phoneNumber });
    const isNew = !user;

    if (!user) {
      user = await User.create({
        name: name || `User-${uid?.slice(0, 6) || "new"}`,
        phone: phoneNumber,
      });
    }

    return res.status(200).json({
      message: "Login successful.",
      role: "customer",
      isNew,
      user,
    });
  } catch (error) {
    console.error("customerLogin error:", error);
    return res.status(500).json({ message: "Customer login failed.", error: error.message });
  }
};

export const professionalLogin = async (req, res) => {
  try {
    const { phone_number: phoneNumber } = req.firebaseUser;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is missing in Firebase token." });
    }

    const professional = await Professional.findOne({ phone: phoneNumber });

    if (!professional) {
      return res.status(200).json({
        message: "No professional account found. Please register first.",
        role: "professional",
        registered: false,
        isNew: true,
      });
    }

    return res.status(200).json({
      message: "Login successful.",
      role: "professional",
      registered: true,
      isNew: false,
      professional,
    });
  } catch (error) {
    console.error("professionalLogin error:", error);
    return res.status(500).json({ message: "Professional login failed.", error: error.message });
  }
};

export const professionalRegister = async (req, res) => {
  try {
    const { phone_number: phoneNumber } = req.firebaseUser;
    const { name, skills, experience, address } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is missing in Firebase token." });
    }

    if (!name || !skills) {
      return res.status(400).json({ message: "name and skills are required." });
    }

    const exists = await Professional.findOne({ phone: phoneNumber });
    if (exists) {
      return res.status(409).json({ message: "Professional already registered." });
    }

    const aadharUrl = req.files?.aadhar?.[0] ? `/uploads/${req.files.aadhar[0].filename}` : "";
    const panUrl = req.files?.pan?.[0] ? `/uploads/${req.files.pan[0].filename}` : "";

    const parsedSkills = Array.isArray(skills)
      ? skills
      : (() => {
          try {
            const maybe = JSON.parse(skills);
            return Array.isArray(maybe) ? maybe : String(skills).split(",").map((s) => s.trim());
          } catch {
            return String(skills).split(",").map((s) => s.trim());
          }
        })();

    const professional = await Professional.create({
      name,
      phone: phoneNumber,
      address: typeof address === "string" ? address.trim() : "",
      skills: parsedSkills,
      experience: experience ? Number(experience) : 0,
      location: {
        type: "Point",
        coordinates: address?.lng && address?.lat ? [Number(address.lng), Number(address.lat)] : [0, 0],
      },
      documents: { aadharUrl, panUrl },
      status: "pending",
    });

    return res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      professional,
    });
  } catch (error) {
    console.error("professionalRegister error:", error);
    return res.status(500).json({ message: "Professional registration failed.", error: error.message });
  }
};
