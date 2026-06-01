import { Router } from "express";
import {
  adminFlagAcquisition,
  adminGetAcquisitionEvents,
  adminListAcquisitions,
  adminResolveAcquisition,
} from "../controllers/adminAcquisitionController";
import { requireAuth, requireRole } from "../middleware/auth";
import { slidingWindowRateLimit } from "../middleware/rateLimit";

const router = Router();
const limiter = slidingWindowRateLimit({ windowMs: 60_000, max: 60 });

router.get("/admin/acquisition-requests", limiter, requireAuth, requireRole(["admin"]), adminListAcquisitions);
router.get(
  "/admin/acquisition-requests/:id/events",
  limiter,
  requireAuth,
  requireRole(["admin"]),
  adminGetAcquisitionEvents,
);
router.post(
  "/admin/acquisition-requests/:id/flag",
  limiter,
  requireAuth,
  requireRole(["admin"]),
  adminFlagAcquisition,
);
router.post(
  "/admin/acquisition-requests/:id/resolve",
  limiter,
  requireAuth,
  requireRole(["admin"]),
  adminResolveAcquisition,
);

export default router;

