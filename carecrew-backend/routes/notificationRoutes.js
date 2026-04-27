import express from "express";
import { getMyNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

export default router;
