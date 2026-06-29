"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Apply auth and admin role to all routes in this file
router.use(auth_1.requireAuth, (0, auth_1.requireRole)(["admin"]));
// Bookings
router.get("/bookings", adminController_1.getAllBookings);
router.patch("/bookings/:id/status", adminController_1.updateBookingStatus);
// Verifications
router.get("/verifications", adminController_1.getVerificationRequests);
router.patch("/verifications/:id/status", adminController_1.updateVerificationStatus);
// Reviews
router.get("/reviews", adminController_1.getAllReviews);
router.delete("/reviews/:id", adminController_1.deleteReview);
exports.default = router;
