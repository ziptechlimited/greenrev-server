import { Router } from "express";
import { createVendorMessage, getVendorMessages } from "../controllers/vendorController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public: Customer sends a message to a vendor
router.post("/vendors/:id/messages", requireAuth, createVendorMessage);

// Vendor: Retrieve their own message inbox
router.get("/vendor/messages", requireAuth, requireRole(["vendor"]), getVendorMessages);

export default router;
