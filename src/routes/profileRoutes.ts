import { Router } from "express";
import { getProfile, updateProfile, getUserMessages } from "../controllers/profileController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.get("/profile/messages", requireAuth, getUserMessages);

export default router;
