import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);

export default router;
