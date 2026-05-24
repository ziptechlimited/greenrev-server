"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
(0, dotenv_1.config)();
const updateProducts = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('Connected.');
        const vendorId = '6a12f080758f82a3b79a3df3';
        const user = await User_1.User.findById(vendorId);
        if (!user) {
            console.error('Vendor not found.');
            process.exit(1);
        }
        const vendorName = user.name || user.companyName || 'Samuel Okon';
        console.log(`Updating all products to vendor: ${vendorName} (${vendorId})...`);
        const result = await Product_1.Product.updateMany({}, // all products
        {
            vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
            vendorName: vendorName
        });
        console.log(`Successfully updated ${result.modifiedCount} products.`);
        process.exit(0);
    }
    catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
};
updateProducts();
