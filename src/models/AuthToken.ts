import { Schema, model, type InferSchemaType } from "mongoose";

export type AuthTokenType = "email_verify" | "password_reset";

const authTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, enum: ["email_verify", "password_reset"] satisfies AuthTokenType[] },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, required: false, default: null },
  },
  { timestamps: true },
);

export type AuthTokenDocument = InferSchemaType<typeof authTokenSchema>;

export const AuthToken = model("AuthToken", authTokenSchema);

