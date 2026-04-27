import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpeg, jpg, png, pdf files are allowed."));
  }
};

export const uploadKYC = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).fields([
  { name: "aadhar", maxCount: 1 },
  { name: "pan", maxCount: 1 },
]);

export const uploadServiceImage = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single("image");
