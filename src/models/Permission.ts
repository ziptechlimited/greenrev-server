import { Schema, model, type InferSchemaType } from "mongoose";

const permissionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: false, trim: true },
    module: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type PermissionDocument = InferSchemaType<typeof permissionSchema> & { _id: unknown };

export const Permission = model("Permission", permissionSchema);
