"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationRequest = void 0;
const mongoose_1 = require("mongoose");
const verificationRequestSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    levelRequested: { type: String, required: true, enum: ["individual", "business"] },
    status: { type: String, required: true, enum: ["pending", "approved", "rejected", "info_requested"], default: "pending" },
    // Level 2 (Individual)
    nin: { type: String, required: false },
    selfieUrl: { type: String, required: false },
    // Level 3 (Business)
    cacNumber: { type: String, required: false },
    cacDocumentUrl: { type: String, required: false },
    directorIdUrl: { type: String, required: false },
    businessAddress: { type: String, required: false },
    bankAccountNumber: { type: String, required: false },
    bankCode: { type: String, required: false },
    // Admin fields
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: false },
    adminNotes: { type: String, required: false },
}, { timestamps: true });
exports.VerificationRequest = (0, mongoose_1.model)("VerificationRequest", verificationRequestSchema);
