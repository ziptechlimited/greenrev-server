import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { getProfile, updateProfile, updateLocation } from "../controllers/mechanicController";

const router = Router();

router.get("/mechanic/profile", requireAuth, requireRole(["mechanic"]), getProfile);
router.patch("/mechanic/profile", requireAuth, requireRole(["mechanic"]), updateProfile);
router.patch("/mechanic/location", requireAuth, requireRole(["mechanic"]), updateLocation);

export default router;
