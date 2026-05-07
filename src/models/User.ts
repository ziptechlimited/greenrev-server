import { Schema, model, type InferSchemaType } from "mongoose";
import type { UserRole } from "../types/auth";

const userSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true, unique: true },
    name: { type: String, required: false, trim: true, default: null },
    role: { type: String, required: true, enum: ["customer", "vendor", "mechanic", "admin"] satisfies UserRole[] },
    companyName: { type: String, required: false, trim: true, default: null },
    garageName: { type: String, required: false, trim: true, default: null },
    passwordHash: { type: String, required: false, default: null },
    googleId: { type: String, required: false, default: null, index: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: unknown };

export const User = model("User", userSchema);
