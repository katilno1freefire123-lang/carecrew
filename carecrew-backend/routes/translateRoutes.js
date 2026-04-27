import { Router } from "express";
import { translateText } from "../controllers/translateController.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";

const router = Router();

// Authenticated — only logged-in users can call translation
// (prevents abuse of your Google Translate API quota)
router.post("/", verifyFirebaseToken, translateText);

export default router;
