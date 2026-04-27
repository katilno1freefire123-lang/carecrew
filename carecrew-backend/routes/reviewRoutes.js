import express from "express";
import { createReview, getProfessionalReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/professional/:professionalId", getProfessionalReviews);

export default router;
