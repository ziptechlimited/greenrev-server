import { Schema, model, type InferSchemaType } from "mongoose";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: false, trim: true },
    level: { type: Number, required: true, min: 1, max: 5 }, // e.g. 5 for Super Admin, 3 for Operations, 2 for Support
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
    isSystem: { type: Boolean, required: true, default: false }, // Cannot be deleted if true
  },
  { timestamps: true }
);

export type RoleDocument = InferSchemaType<typeof roleSchema> & { _id: unknown };

export const Role = model("Role", roleSchema);
