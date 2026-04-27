import express from "express";
import {
  adminLogin,
  approveProfessional,
  rejectProfessional,
  getAllBookings,
  getAllUsers,
  getAllProfessionals,
  getDashboardStats,
} from "../controllers/adminController.js";
import { verifyAdminJWT } from "../middleware/verifyAdminJWT.js";

const router = express.Router();

router.post("/login", adminLogin);

router.use(verifyAdminJWT);
router.get("/dashboard", getDashboardStats);
router.patch("/professionals/:id/approve", approveProfessional);
router.patch("/professionals/:id/reject", rejectProfessional);
router.get("/bookings", getAllBookings);
router.get("/users", getAllUsers);
router.get("/professionals", getAllProfessionals);

export default router;
