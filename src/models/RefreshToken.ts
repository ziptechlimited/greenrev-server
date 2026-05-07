import { Schema, model, type InferSchemaType } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    csrfHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, required: false, default: null },
    replacedByTokenHash: { type: String, required: false, default: null },
  },
  { timestamps: true },
);

export type RefreshTokenDocument = InferSchemaType<typeof refreshTokenSchema>;

export const RefreshToken = model("RefreshToken", refreshTokenSchema);
