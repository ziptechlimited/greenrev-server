import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVendorMessage extends Document {
  vendorId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  productId?: mongoose.Types.ObjectId;
  productName?: string;
  message: string;
  reply?: string;
  replyDate?: Date;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: Date;
  updatedAt: Date;
}

const vendorMessageSchema = new Schema<IVendorMessage>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    senderPhone: { type: String },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String },
    message: { type: String, required: true },
    reply: { type: String },
    replyDate: { type: Date },
    status: {
      type: String,
      enum: ["NEW", "READ", "REPLIED"],
      default: "NEW",
    },
  },
  {
    timestamps: true,
  }
);

export const VendorMessage: Model<IVendorMessage> =
  mongoose.models.VendorMessage || mongoose.model<IVendorMessage>("VendorMessage", vendorMessageSchema);
