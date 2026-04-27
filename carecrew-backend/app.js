import cors from "cors";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import professionalRoutes from "./routes/professionalRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import translateRoutes from "./routes/translateRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["*"];
const allowAnyOrigin = corsOrigins.includes("*");

app.use(
  cors({
    origin: allowAnyOrigin ? true : corsOrigins,
    credentials: !allowAnyOrigin,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// serve uploaded KYC docs / images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "carecrew-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/translate", translateRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    message: error.message || "Internal server error.",
  });
});

export default app;
