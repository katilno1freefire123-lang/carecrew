import express from "express";
import { getProfile, getMyProfile, updateMyProfile, updateProfile } from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

router.get("/profile", verifyFirebaseToken, getMyProfile);
router.put("/profile", verifyFirebaseToken, updateMyProfile);

router.get("/:id", getProfile);
router.put("/:id", updateProfile);

export default router;
