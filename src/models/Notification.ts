import { Schema, model, type InferSchemaType } from "mongoose";

const notificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'message', 'alert', 'system'
    relatedId: { type: String, required: false }, // Optional ID to link to an entity (like a Chat ID)
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & { _id: unknown; createdAt: Date };

export const Notification = model("Notification", notificationSchema);
