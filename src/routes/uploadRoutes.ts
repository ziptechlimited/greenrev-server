import { Router } from "express";
import multer from "multer";
import { uploadProductMedia } from "../controllers/uploadController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Use memory storage for multer to avoid local file system writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post("/upload", upload.single("file"), requireAuth, uploadProductMedia);

export default router;
