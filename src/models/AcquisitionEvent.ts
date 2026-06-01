import { Schema, model, type InferSchemaType } from "mongoose";
import type { AcquisitionEventAction, AcquisitionStatus } from "../types/acquisition";

const acquisitionEventSchema = new Schema(
  {
    requestId: { type: Schema.Types.ObjectId, ref: "AcquisitionRequest", required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, enum: ["created", "vendor_accepted", "receipt_uploaded", "payment_confirmed", "client_completed", "admin_flagged", "admin_resolved"] satisfies AcquisitionEventAction[] },
    fromStatus: { type: String, required: false, default: null, enum: ["pending", "accepted", "receipt_uploaded", "payment_confirmed", "completed"] satisfies AcquisitionStatus[] },
    toStatus: { type: String, required: false, default: null, enum: ["pending", "accepted", "receipt_uploaded", "payment_confirmed", "completed"] satisfies AcquisitionStatus[] },
    metadata: { type: Schema.Types.Mixed, required: false, default: null },
  },
  { timestamps: true },
);

export type AcquisitionEventDocument = InferSchemaType<typeof acquisitionEventSchema>;

export const AcquisitionEvent = model("AcquisitionEvent", acquisitionEventSchema);

