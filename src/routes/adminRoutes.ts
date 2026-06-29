import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  getAllBookings,
  updateBookingStatus,
  getVerificationRequests,
  updateVerificationStatus,
  getAllReviews,
  deleteReview,
} from "../controllers/adminController";

const router = Router();

// Apply auth and admin role to all routes in this file
router.use(requireAuth, requireRole(["admin"]));

// Bookings
router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

// Verifications
router.get("/verifications", getVerificationRequests);
router.patch("/verifications/:id/status", updateVerificationStatus);

// Reviews
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

export default router;
