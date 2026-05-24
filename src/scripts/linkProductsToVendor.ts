import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Product } from '../models/Product';
import { User } from '../models/User';

config();

const updateProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected.');

    const vendorId = '6a12f080758f82a3b79a3df3';
    const user = await User.findById(vendorId);

    if (!user) {
      console.error('Vendor not found.');
      process.exit(1);
    }

    const vendorName = user.name || user.companyName || 'Samuel Okon';
    
    console.log(`Updating all products to vendor: ${vendorName} (${vendorId})...`);

    const result = await Product.updateMany(
      {}, // all products
      { 
        vendorId: new mongoose.Types.ObjectId(vendorId),
        vendorName: vendorName
      }
    );

    console.log(`Successfully updated ${result.modifiedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
};

updateProducts();
