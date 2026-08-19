import mongoose, { Document, Model, Schema } from "mongoose";

export interface IExpertMessage extends Document {
  expertId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: Date;
  updatedAt: Date;
}

const expertMessageSchema = new Schema<IExpertMessage>(
  {
    expertId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    senderPhone: { type: String },
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

export const ExpertMessage: Model<IExpertMessage> =
  mongoose.models.ExpertMessage || mongoose.model<IExpertMessage>("ExpertMessage", expertMessageSchema);
