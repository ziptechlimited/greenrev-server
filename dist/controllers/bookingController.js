"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.getMechanicBookings = getMechanicBookings;
exports.updateBookingStatus = updateBookingStatus;
const Booking_1 = require("../models/Booking");
const User_1 = require("../models/User");
const errors_1 = require("../utils/errors");
const apiResponse_1 = require("../utils/apiResponse");
async function createBooking(req, res) {
    if (!req.user) {
        throw new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    const { mechanicId, vehicleDetails, issueDescription, requestedDate } = req.body;
    if (!mechanicId || !vehicleDetails || !issueDescription || !requestedDate) {
        throw new errors_1.ApiError(400, "BAD_REQUEST", "Missing required fields");
    }
    // Ensure mechanic exists and is actually a mechanic
    const mechanic = await User_1.User.findById(mechanicId);
    if (!mechanic || mechanic.role !== "mechanic") {
        throw new errors_1.ApiError(404, "NOT_FOUND", "Mechanic not found");
    }
    const booking = new Booking_1.Booking({
        userId: req.user.id,
        mechanicId,
        vehicleDetails,
        issueDescription,
        requestedDate: new Date(requestedDate),
    });
    await booking.save();
    return (0, apiResponse_1.sendSuccess)(res, 201, { booking });
}
async function getMechanicBookings(req, res) {
    if (!req.user) {
        throw new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    const bookings = await Booking_1.Booking.find({ mechanicId: req.user.id })
        .populate("userId", "name email phone profileImage")
        .sort({ requestedDate: 1 });
    return (0, apiResponse_1.sendSuccess)(res, 200, { bookings });
}
async function updateBookingStatus(req, res) {
    if (!req.user) {
        throw new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!["CONFIRMED", "REJECTED", "COMPLETED"].includes(status)) {
        throw new errors_1.ApiError(400, "BAD_REQUEST", "Invalid status");
    }
    const booking = await Booking_1.Booking.findOne({ _id: id, mechanicId: req.user.id });
    if (!booking) {
        throw new errors_1.ApiError(404, "NOT_FOUND", "Booking not found");
    }
    booking.status = status;
    await booking.save();
    return (0, apiResponse_1.sendSuccess)(res, 200, { booking });
}
