"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const mongoose_1 = require("mongoose");
const refreshTokenSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    csrfHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, required: false, default: null },
    replacedByTokenHash: { type: String, required: false, default: null },
}, { timestamps: true });
exports.RefreshToken = (0, mongoose_1.model)("RefreshToken", refreshTokenSchema);
