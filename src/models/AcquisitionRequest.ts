import { Schema, model, type InferSchemaType } from "mongoose";

const acquisitionRequestSchema = new Schema(
  {
    // Customer info
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: null },

    // Vendor info (snapshot at time of request)
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vendorName: { type: String, required: true },
    vendorEmail: { type: String, required: true },
    vendorPhone: { type: String, default: null },
    vendorCompanyName: { type: String, default: null },

    // Product info (snapshot)
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    productPrice: { type: String, required: true },
    productMake: { type: String, default: null },

    // Request details
    message: { type: String, default: null, maxlength: 1000 },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    // Timestamps for specific status changes
    acceptedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    // Whether vendor has seen this request (for notification badge)
    vendorSeen: { type: Boolean, default: false },

    // Review (populated separately via Review model)
    hasReview: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Compound index to prevent duplicate pending requests for same product
acquisitionRequestSchema.index(
  { customerId: 1, productId: 1 },
  { unique: false },
);

export type AcquisitionRequestDocument = InferSchemaType<
  typeof acquisitionRequestSchema
> & { _id: unknown };

export const AcquisitionRequest = model(
  "AcquisitionRequest",
  acquisitionRequestSchema,
);
