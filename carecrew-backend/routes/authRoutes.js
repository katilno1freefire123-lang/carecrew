import express from "express";
import { customerLogin, professionalLogin, professionalRegister } from "../controllers/authController.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";
import { uploadKYC } from "../middleware/upload.js";

const router = express.Router();

router.post("/customer/login", verifyFirebaseToken, customerLogin);
router.post("/professional/login", verifyFirebaseToken, professionalLogin);
router.post("/professional/register", verifyFirebaseToken, uploadKYC, professionalRegister);

export default router;
