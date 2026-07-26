import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiry>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
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

export const Inquiry: Model<IInquiry> =
  mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", inquirySchema);
