import { Schema, model, type InferSchemaType } from "mongoose";

const approvalRequestSchema = new Schema(
  {
    action: { type: String, required: true }, // e.g. "suspend_user"
    targetModel: { type: String, required: true }, // e.g. "User"
    targetId: { type: String, required: true }, // User ID
    requestedData: { type: Schema.Types.Mixed, required: true }, // The new state or data
    requesterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requesterRole: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, required: true, enum: ["pending", "approved", "rejected"], default: "pending" },
    approverId: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null },
    approverRole: { type: String, required: false, default: null },
    approverNotes: { type: String, required: false, default: null },
    resolvedAt: { type: Date, required: false, default: null },
  },
  { timestamps: true }
);

export type ApprovalRequestDocument = InferSchemaType<typeof approvalRequestSchema> & { _id: unknown };

export const ApprovalRequest = model("ApprovalRequest", approvalRequestSchema);
