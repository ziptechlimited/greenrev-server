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
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
