import mongoose from "mongoose";

export async function connectDB(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);
}

