import { Router } from "express";
import {
  createInquiry,
  listInquiries,
  updateInquiryStatus,
} from "../controllers/inquiryController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public endpoint for submitting inquiries
router.post("/inquiries", createInquiry);

// Admin endpoints
router.get(
  "/admin/inquiries",
  requireAuth,
  requireRole(["admin"]),
  listInquiries
);
router.patch(
  "/admin/inquiries/:id/status",
  requireAuth,
  requireRole(["admin"]),
  updateInquiryStatus
);

export default router;
