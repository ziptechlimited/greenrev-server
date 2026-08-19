import type { Response } from "express";
import { Booking } from "../models/Booking";
import { User } from "../models/User";
import { ApiError } from "../utils/errors";
import { sendSuccess } from "../utils/apiResponse";
import type { CustomReq } from "../types/auth";
import { sendEmail } from "../services/emailService";

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

  // Send email to mechanic
  try {
    const customer = await User.findById(req.user.id);
    const customerName = customer?.name || "A customer";
    const customerEmail = customer?.email || "Unknown email";
    const customerPhone = customer?.phone || "No phone provided";

    const emailHtml = `
      <div style="font-family: sans-serif; color: #333;">
        <h2>New Service Request</h2>
        <p>You have received a new service request from <strong>${customerName}</strong>.</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Requested Date:</strong> ${new Date(requestedDate).toLocaleString()}</li>
          <li><strong>Vehicle Details:</strong> ${vehicleDetails}</li>
          <li><strong>Issue:</strong> ${issueDescription}</li>
        </ul>

        <h3>Customer Contact:</h3>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></li>
          <li><strong>Phone:</strong> <a href="tel:${customerPhone}">${customerPhone}</a></li>
        </ul>

        <p>Please log in to your <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/mechanic/dashboard">Dashboard</a> to confirm or reject this booking.</p>
        
        <br />
        <p>Best regards,<br />The GreenRev Team</p>
      </div>
    `;

    await sendEmail({
      to: mechanic.email,
      subject: `New Service Request from ${customerName} - GreenRev`,
      html: emailHtml,
    });
  } catch (emailError) {
    console.error("Failed to send booking notification email to mechanic:", emailError);
    // Don't fail the booking if the email fails
  }

  return sendSuccess(res, 201, { booking });
}

export async function getMyBookings(req: CustomReq, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const bookings = await Booking.find({ userId: req.user.id })
    .populate("mechanicId", "name email phone garageName")
    .sort({ requestedDate: -1 });

  return sendSuccess(res, 200, { bookings });
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
