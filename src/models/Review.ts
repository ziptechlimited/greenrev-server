import { Schema, model, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    acquisitionRequestId: {
      type: Schema.Types.ObjectId,
      ref: "AcquisitionRequest",
      required: true,
      unique: true, // One review per transaction
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true },
);

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & {
  _id: unknown;
};

export const Review = model("Review", reviewSchema);
