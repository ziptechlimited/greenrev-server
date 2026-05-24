"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSpecsSchema = new mongoose_1.Schema({
    horsepower: { type: Number },
    torque: { type: String },
    transmission: { type: String },
    topSpeed: { type: String },
    acceleration: { type: Number },
    range: { type: String },
    battery: { type: String },
    charging: { type: String },
    compatibility: { type: String },
    warranty: { type: String },
}, { _id: false });
const productColorSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    hex: { type: String, required: true },
}, { _id: false });
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    make: { type: String, required: true, trim: true },
    category: {
        type: String,
        required: true,
        enum: ["vehicle", "part"],
        index: true,
    },
    price: { type: String, required: true },
    priceValue: { type: Number },
    year: { type: Number },
    mileage: { type: String },
    color: { type: productColorSchema },
    image: { type: String, required: true },
    images: [{ type: String }],
    specs: { type: productSpecsSchema },
    description: { type: String },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 1 },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    vendorName: { type: String },
}, {
    timestamps: true,
});
productSchema.index({ name: "text", make: "text", description: "text" });
productSchema.index({ createdAt: -1 });
exports.Product = (0, mongoose_1.model)("Product", productSchema);
