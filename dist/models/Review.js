"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    acquisitionRequestId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "AcquisitionRequest",
        required: true,
        unique: true, // One review per transaction
        index: true,
    },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        default: null,
        maxlength: 2000,
    },
    customerName: { type: String, required: true },
    productName: { type: String, required: true },
}, { timestamps: true });
exports.Review = (0, mongoose_1.model)("Review", reviewSchema);
