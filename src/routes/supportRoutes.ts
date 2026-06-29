import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  createTicket,
  getUserTickets,
  getAllTickets,
  replyToTicket,
  updateTicketStatus,
} from "../controllers/supportController";

const router = Router();

// User endpoints
router.post("/support", requireAuth, createTicket);
router.get("/support/me", requireAuth, getUserTickets);
router.post("/support/:id/reply", requireAuth, replyToTicket); // Users can reply

// Admin endpoints
router.get("/admin/support", requireAuth, requireRole(["admin"]), getAllTickets);
router.patch("/admin/support/:id/status", requireAuth, requireRole(["admin"]), updateTicketStatus);

export default router;
