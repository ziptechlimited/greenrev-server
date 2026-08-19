import { Schema, model, type InferSchemaType } from "mongoose";

const expertReviewSchema = new Schema(
  {
    expertId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

// One review per user per expert
expertReviewSchema.index({ expertId: 1, authorId: 1 }, { unique: true });

export type ExpertReviewDocument = InferSchemaType<typeof expertReviewSchema> & { _id: unknown };

export const ExpertReview = model("ExpertReview", expertReviewSchema);
