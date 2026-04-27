import express from "express";
import { completeCashPayment, createOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/cash", completeCashPayment);

export default router;