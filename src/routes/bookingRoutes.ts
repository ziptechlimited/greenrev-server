import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { createBooking, getMyBookings, getMechanicBookings, updateBookingStatus } from "../controllers/bookingController";

const router = Router();

router.post("/bookings", requireAuth, createBooking);
// Customer: view their own expert service bookings
router.get("/bookings/my", requireAuth, getMyBookings);
router.get("/bookings/mechanic", requireAuth, requireRole(["mechanic"]), getMechanicBookings);
router.patch("/bookings/:id/status", requireAuth, requireRole(["mechanic"]), updateBookingStatus);

export default router;
