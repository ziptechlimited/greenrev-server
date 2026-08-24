import { Schema, model, type InferSchemaType } from "mongoose";

const auditLogSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true, index: true }, // e.g., 'user.suspend', 'transaction.flag', 'role.assign'
    module: { type: String, required: true }, // e.g., 'Customers', 'Transactions', 'Roles'
    targetModel: { type: String, required: true }, // The mongoose model name affected
    targetId: { type: String, required: true, index: true }, // The ID of the affected document
    previousState: { type: Schema.Types.Mixed, required: false, default: null },
    newState: { type: Schema.Types.Mixed, required: false, default: null },
    ipAddress: { type: String, required: false, default: null },
    userAgent: { type: String, required: false, default: null },
    reason: { type: String, required: false, default: null },
    approverId: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null }, // If Maker-Checker was used
  },
  { timestamps: true }
);

// Prevent updates to audit logs to ensure immutability
auditLogSchema.pre("findOneAndUpdate", function () {
  throw new Error("Audit logs are immutable and cannot be updated.");
});
auditLogSchema.pre("updateOne", function () {
  throw new Error("Audit logs are immutable and cannot be updated.");
});
auditLogSchema.pre("updateMany", function () {
  throw new Error("Audit logs are immutable and cannot be updated.");
});
auditLogSchema.pre("deleteOne", function () {
  throw new Error("Audit logs are immutable and cannot be deleted.");
});
auditLogSchema.pre("deleteMany", function () {
  throw new Error("Audit logs are immutable and cannot be deleted.");
});
auditLogSchema.pre("findOneAndDelete", function () {
  throw new Error("Audit logs are immutable and cannot be deleted.");
});

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema> & { _id: unknown };

export const AuditLog = model("AuditLog", auditLogSchema);
