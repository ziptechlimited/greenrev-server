"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcquisitionEvent = void 0;
const mongoose_1 = require("mongoose");
const acquisitionEventSchema = new mongoose_1.Schema({
    requestId: { type: mongoose_1.Schema.Types.ObjectId, ref: "AcquisitionRequest", required: true, index: true },
    actorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, enum: ["created", "vendor_accepted", "receipt_uploaded", "payment_confirmed", "client_completed", "admin_flagged", "admin_resolved"] },
    fromStatus: { type: String, required: false, default: null, enum: ["pending", "accepted", "receipt_uploaded", "payment_confirmed", "completed"] },
    toStatus: { type: String, required: false, default: null, enum: ["pending", "accepted", "receipt_uploaded", "payment_confirmed", "completed"] },
    metadata: { type: mongoose_1.Schema.Types.Mixed, required: false, default: null },
}, { timestamps: true });
exports.AcquisitionEvent = (0, mongoose_1.model)("AcquisitionEvent", acquisitionEventSchema);
