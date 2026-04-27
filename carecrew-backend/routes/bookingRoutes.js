import express from "express";
import {
  createBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
  getCustomerBookings,
  getProfessionalJobs,
  getProfessionalTasks,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create", createBooking);
router.post("/:id/accept", acceptBooking);
router.post("/:id/reject", rejectBooking);
router.post("/:id/complete", completeBooking);
router.get("/customer/:customerId", getCustomerBookings);
router.get("/professional/:professionalId/jobs", getProfessionalJobs);
router.get("/professional/:professionalId/tasks", getProfessionalTasks);

export default router;
