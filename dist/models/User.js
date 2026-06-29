"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: { type: String, required: true, lowercase: true, trim: true, index: true, unique: true },
    name: { type: String, required: false, trim: true, default: null },
    role: { type: String, required: true, enum: ["customer", "vendor", "mechanic", "admin"] },
    companyName: { type: String, required: false, trim: true, default: null },
    garageName: { type: String, required: false, trim: true, default: null },
    phone: { type: String, required: false, trim: true, default: null },
    bio: { type: String, required: false, trim: true, default: null },
    profileImage: { type: String, required: false, default: null },
    passwordHash: { type: String, required: false, default: null },
    googleId: { type: String, required: false, default: null, index: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
    isPhoneVerified: { type: Boolean, required: true, default: false },
    verificationLevel: { type: String, required: true, enum: ["basic", "individual", "business"], default: "basic" },
    verificationStatus: { type: String, required: true, enum: ["unverified", "pending", "verified", "rejected"], default: "unverified" },
    status: { type: String, required: true, enum: ["active", "suspended"], default: "active", index: true },
    // Fields for Mechanics / Experts
    city: { type: String, required: false, default: null },
    country: { type: String, required: false, default: null },
    address: { type: String, required: false, default: null },
    lat: { type: Number, required: false, default: null },
    lng: { type: Number, required: false, default: null },
    specialization: { type: [String], required: false, default: [] },
    hourlyRate: { type: Number, required: false, default: null },
    availability: {
        type: {
            monday: { available: Boolean, start: String, end: String },
            tuesday: { available: Boolean, start: String, end: String },
            wednesday: { available: Boolean, start: String, end: String },
            thursday: { available: Boolean, start: String, end: String },
            friday: { available: Boolean, start: String, end: String },
            saturday: { available: Boolean, start: String, end: String },
            sunday: { available: Boolean, start: String, end: String },
        },
        required: false,
        default: null,
        _id: false,
    },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
