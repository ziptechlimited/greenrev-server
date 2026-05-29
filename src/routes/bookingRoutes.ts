import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { createBooking, getMechanicBookings, updateBookingStatus } from "../controllers/bookingController";

const router = Router();

router.post("/bookings", requireAuth, createBooking);
router.get("/bookings/mechanic", requireAuth, requireRole(["mechanic"]), getMechanicBookings);
router.patch("/bookings/:id/status", requireAuth, requireRole(["mechanic"]), updateBookingStatus);

export default router;
