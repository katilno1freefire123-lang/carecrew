import express from "express";
import {
  createService,
  updateService,
  deleteService,
  getAllServices,
  getServiceById,
} from "../controllers/serviceController.js";
import { verifyAdminJWT } from "../middleware/verifyAdminJWT.js";
import { uploadServiceImage } from "../middleware/upload.js";

const router = express.Router();

// public
router.get("/", getAllServices);
router.get("/:id", getServiceById);

// admin only
router.post("/", verifyAdminJWT, uploadServiceImage, createService);
router.put("/:id", verifyAdminJWT, uploadServiceImage, updateService);
router.delete("/:id", verifyAdminJWT, deleteService);

export default router;
