import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { getProfile, updateProfile, updateLocation, getExpertMessages, replyToExpertMessage } from "../controllers/mechanicController";

const router = Router();

router.get("/mechanic/profile", requireAuth, requireRole(["mechanic"]), getProfile);
router.patch("/mechanic/profile", requireAuth, requireRole(["mechanic"]), updateProfile);
router.patch("/mechanic/location", requireAuth, requireRole(["mechanic"]), updateLocation);
router.get("/mechanic/messages", requireAuth, requireRole(["mechanic"]), getExpertMessages);
router.patch("/mechanic/messages/:id/reply", requireAuth, requireRole(["mechanic"]), replyToExpertMessage);

export default router;
