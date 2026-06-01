import { Schema, model, type InferSchemaType } from "mongoose";

const messageSchema = new Schema(
  {
    acquisitionId: { type: Schema.Types.ObjectId, ref: "AcquisitionRequest", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

export type MessageDocument = InferSchemaType<typeof messageSchema>;

export const Message = model("Message", messageSchema);
