import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getMyNotifications, markAsRead } from "../controllers/notificationController";

const router = Router();

router.get("/notifications", requireAuth, getMyNotifications);
router.post("/notifications/read", requireAuth, markAsRead);

export default router;
