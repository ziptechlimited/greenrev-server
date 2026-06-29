"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bookingSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    mechanicId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    vehicleDetails: {
        make: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: String, required: true },
    },
    issueDescription: {
        type: String,
        required: true,
    },
    requestedDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "REJECTED", "COMPLETED"],
        default: "PENDING",
    },
}, {
    timestamps: true,
});
exports.Booking = mongoose_1.default.model("Booking", bookingSchema);
