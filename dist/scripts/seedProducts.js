"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
const Product_1 = require("../models/Product");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
(0, dotenv_1.config)();
const seed = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("Connected.");
        // 1. Use the specific vendor ID
        const vendorId = "6a12f080758f82a3b79a3df3";
        const vendorName = "Samuel Okon";
        console.log(`Using vendor: ${vendorName} (${vendorId})`);
        // 2. Clear existing products to avoid duplicates if re-running
        // (Optional: only if you want a clean start)
        // await Product.deleteMany({ vendorId });
        // 3. Load Vehicles
        const inventoryPath = path.join(__dirname, "../../../greenrev-client/src/data/inventory.json");
        if (fs.existsSync(inventoryPath)) {
            const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
            console.log(`Found ${inventoryData.length} vehicles to seed.`);
            for (const item of inventoryData) {
                // Check if product already exists by name
                const exists = await Product_1.Product.findOne({ name: item.name });
                if (exists)
                    continue;
                await Product_1.Product.create({
                    name: item.name,
                    make: item.make,
                    category: "vehicle",
                    price: item.price,
                    priceValue: parseFloat(item.price.replace(/[^0-9.]/g, "")),
                    year: item.year,
                    mileage: item.mileage,
                    color: item.color,
                    image: item.image,
                    specs: {
                        acceleration: item.specs["0_100"],
                        horsepower: item.specs.horsepower,
                        torque: item.specs.torque,
                        transmission: item.specs.transmission,
                        topSpeed: item.specs.topSpeed,
                    },
                    vendorId,
                    vendorName,
                });
            }
        }
        // 4. Load Parts
        const partsPath = path.join(__dirname, "../../../greenrev-client/src/data/parts.json");
        if (fs.existsSync(partsPath)) {
            const partsData = JSON.parse(fs.readFileSync(partsPath, "utf8"));
            console.log(`Found ${partsData.length} parts to seed.`);
            for (const item of partsData) {
                // Check if product already exists by name
                const exists = await Product_1.Product.findOne({ name: item.name });
                if (exists)
                    continue;
                await Product_1.Product.create({
                    name: item.name,
                    make: item.brand || item.category, // using brand or category as make
                    category: "part",
                    price: `$${item.price.toLocaleString()}`,
                    priceValue: item.price,
                    description: item.description,
                    image: item.image,
                    specs: {
                        compatibility: item.specs ? item.specs.join(", ") : "Universal",
                    },
                    vendorId,
                    vendorName,
                });
            }
        }
        console.log("Seeding completed successfully.");
        process.exit(0);
    }
    catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};
seed();
