"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcquisitionRequest = void 0;
const mongoose_1 = require("mongoose");
const acquisitionRequestSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: false, default: null },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vendorName: { type: String, required: true },
    vendorEmail: { type: String, required: true },
    vendorPhone: { type: String, required: false, default: null },
    vendorCompanyName: { type: String, required: false, default: null },
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    productPrice: { type: String, required: true },
    productMake: { type: String, required: false, default: null },
    quantity: { type: Number, required: true, default: 1 },
    message: { type: String, required: false, default: null },
    status: { type: String, required: true, default: "pending", enum: ["pending", "accepted", "receipt_uploaded", "payment_confirmed", "completed"] },
    acceptedAt: { type: Date, required: false, default: null },
    receiptUrl: { type: String, required: false, default: null },
    receiptUploadedAt: { type: Date, required: false, default: null },
    vendorPaymentAmount: { type: Number, required: false, default: null },
    vendorPaymentConfirmedAt: { type: Date, required: false, default: null },
    completedAt: { type: Date, required: false, default: null },
    vendorSeen: { type: Boolean, required: true, default: false },
    hasReview: { type: Boolean, required: true, default: false },
    adminFlaggedAt: { type: Date, required: false, default: null },
    adminFlagReason: { type: String, required: false, default: null },
    adminResolvedAt: { type: Date, required: false, default: null },
    adminResolution: { type: String, required: false, default: null },
}, { timestamps: true });
exports.AcquisitionRequest = (0, mongoose_1.model)("AcquisitionRequest", acquisitionRequestSchema);
