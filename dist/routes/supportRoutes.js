"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const supportController_1 = require("../controllers/supportController");
const router = (0, express_1.Router)();
// User endpoints
router.post("/support", auth_1.requireAuth, supportController_1.createTicket);
router.get("/support/me", auth_1.requireAuth, supportController_1.getUserTickets);
router.post("/support/:id/reply", auth_1.requireAuth, supportController_1.replyToTicket); // Users can reply
// Admin endpoints
router.get("/admin/support", auth_1.requireAuth, (0, auth_1.requireRole)(["admin"]), supportController_1.getAllTickets);
router.patch("/admin/support/:id/status", auth_1.requireAuth, (0, auth_1.requireRole)(["admin"]), supportController_1.updateTicketStatus);
exports.default = router;
