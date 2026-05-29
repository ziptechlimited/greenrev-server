import type { Response } from "express";
import { Booking } from "../models/Booking";
import { User } from "../models/User";
import { ApiError } from "../utils/errors";
import { sendSuccess } from "../utils/apiResponse";
import type { CustomReq } from "../types/auth";

export async function createBooking(req: CustomReq, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const { mechanicId, vehicleDetails, issueDescription, requestedDate } = req.body;

  if (!mechanicId || !vehicleDetails || !issueDescription || !requestedDate) {
    throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
  }

  // Ensure mechanic exists and is actually a mechanic
  const mechanic = await User.findById(mechanicId);
  if (!mechanic || mechanic.role !== "mechanic") {
    throw new ApiError(404, "NOT_FOUND", "Mechanic not found");
  }

  const booking = new Booking({
    userId: req.user.id,
    mechanicId,
    vehicleDetails,
    issueDescription,
    requestedDate: new Date(requestedDate),
  });

  await booking.save();

  return sendSuccess(res, 201, { booking });
}

export async function getMechanicBookings(req: CustomReq, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const bookings = await Booking.find({ mechanicId: req.user.id })
    .populate("userId", "name email phone profileImage")
    .sort({ requestedDate: 1 });

  return sendSuccess(res, 200, { bookings });
}

export async function updateBookingStatus(req: CustomReq, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!["CONFIRMED", "REJECTED", "COMPLETED"].includes(status)) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid status");
  }

  const booking = await Booking.findOne({ _id: id, mechanicId: req.user.id });
  
  if (!booking) {
    throw new ApiError(404, "NOT_FOUND", "Booking not found");
  }

  booking.status = status;
  await booking.save();

  return sendSuccess(res, 200, { booking });
}
