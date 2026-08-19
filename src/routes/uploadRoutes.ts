import { Router } from "express";
import multer from "multer";
import { uploadProductMedia } from "../controllers/uploadController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Use memory storage for multer to avoid local file system writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file to support videos
  },
});

// Support uploading up to 10 files (images + videos) in one request
router.post("/upload", upload.array("files", 10), requireAuth, uploadProductMedia);

export default router;
