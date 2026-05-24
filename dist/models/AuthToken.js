"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthToken = void 0;
const mongoose_1 = require("mongoose");
const authTokenSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, enum: ["email_verify", "password_reset"] },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, required: false, default: null },
}, { timestamps: true });
exports.AuthToken = (0, mongoose_1.model)("AuthToken", authTokenSchema);
