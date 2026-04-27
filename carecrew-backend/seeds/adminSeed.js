import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";

const runAdminSeed = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env");
    }

    await connectDB();

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "admin",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // eslint-disable-next-line no-console
    console.log("Admin seeded successfully:", admin.email);
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Admin seed failed:", error);
    process.exit(1);
  }
};

runAdminSeed();