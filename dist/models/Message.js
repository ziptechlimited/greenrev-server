"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    acquisitionId: { type: mongoose_1.Schema.Types.ObjectId, ref: "AcquisitionRequest", required: true, index: true },
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
}, { timestamps: true });
exports.Message = (0, mongoose_1.model)("Message", messageSchema);
