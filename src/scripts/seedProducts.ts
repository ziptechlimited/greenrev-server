import mongoose from "mongoose";
import { config } from "dotenv";
import { Product } from "../models/Product";
import { User } from "../models/User";
import * as fs from "fs";
import * as path from "path";

config();

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected.");

    // 1. Use the specific vendor ID
    const vendorId = "6a12f080758f82a3b79a3df3";
    const vendorName = "Samuel Okon";

    console.log(`Using vendor: ${vendorName} (${vendorId})`);

    // 2. Clear existing products to avoid duplicates if re-running
    // (Optional: only if you want a clean start)
    // await Product.deleteMany({ vendorId });

    // 3. Load Vehicles
    const inventoryPath = path.join(
      __dirname,
      "../../../greenrev-client/src/data/inventory.json",
    );
    if (fs.existsSync(inventoryPath)) {
      const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
      console.log(`Found ${inventoryData.length} vehicles to seed.`);

      for (const item of inventoryData) {
        // Check if product already exists by name
        const exists = await Product.findOne({ name: item.name });
        if (exists) continue;

        await Product.create({
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
    const partsPath = path.join(
      __dirname,
      "../../../greenrev-client/src/data/parts.json",
    );
    if (fs.existsSync(partsPath)) {
      const partsData = JSON.parse(fs.readFileSync(partsPath, "utf8"));
      console.log(`Found ${partsData.length} parts to seed.`);

      for (const item of partsData) {
        // Check if product already exists by name
        const exists = await Product.findOne({ name: item.name });
        if (exists) continue;

        await Product.create({
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
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
