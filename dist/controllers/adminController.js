"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getAllReviews = exports.updateVerificationStatus = exports.getVerificationRequests = exports.updateBookingStatus = exports.getAllBookings = void 0;
const Booking_1 = require("../models/Booking");
const VerificationRequest_1 = require("../models/VerificationRequest");
const Review_1 = require("../models/Review");
const apiResponse_1 = require("../utils/apiResponse");
// Bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking_1.Booking.find()
            .populate("userId", "name email")
            .populate("mechanicId", "name email")
            .sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, 200, bookings);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to fetch bookings" });
    }
};
exports.getAllBookings = getAllBookings;
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["PENDING", "CONFIRMED", "REJECTED", "COMPLETED"].includes(status)) {
            return (0, apiResponse_1.sendError)(res, 400, { code: "ERROR", message: "Invalid status" });
        }
        const booking = await Booking_1.Booking.findByIdAndUpdate(id, { status }, { new: true })
            .populate("userId", "name email")
            .populate("mechanicId", "name email");
        if (!booking) {
            return (0, apiResponse_1.sendError)(res, 404, { code: "ERROR", message: "Booking not found" });
        }
        return (0, apiResponse_1.sendSuccess)(res, 200, booking);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to update booking status" });
    }
};
exports.updateBookingStatus = updateBookingStatus;
// Verifications
const getVerificationRequests = async (req, res) => {
    try {
        const requests = await VerificationRequest_1.VerificationRequest.find()
            .populate("user", "name email role verificationLevel")
            .populate("reviewedBy", "name email")
            .sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, 200, requests);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to fetch verification requests" });
    }
};
exports.getVerificationRequests = getVerificationRequests;
const updateVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const adminId = req.user.id;
        if (!["pending", "approved", "rejected", "info_requested"].includes(status)) {
            return (0, apiResponse_1.sendError)(res, 400, { code: "ERROR", message: "Invalid status" });
        }
        const request = await VerificationRequest_1.VerificationRequest.findByIdAndUpdate(id, {
            status,
            adminNotes,
            reviewedBy: adminId
        }, { new: true }).populate("user", "name email role verificationLevel");
        if (!request) {
            return (0, apiResponse_1.sendError)(res, 404, { code: "ERROR", message: "Verification request not found" });
        }
        return (0, apiResponse_1.sendSuccess)(res, 200, request);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to update verification status" });
    }
};
exports.updateVerificationStatus = updateVerificationStatus;
// Reviews Moderation
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review_1.Review.find()
            .populate("customerId", "name email")
            .populate("vendorId", "name email")
            .sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, 200, reviews);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to fetch reviews" });
    }
};
exports.getAllReviews = getAllReviews;
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review_1.Review.findByIdAndDelete(id);
        if (!review)
            return (0, apiResponse_1.sendError)(res, 404, { code: "ERROR", message: "Review not found" });
        return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true });
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to delete review" });
    }
};
exports.deleteReview = deleteReview;
