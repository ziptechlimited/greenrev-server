import { Schema, model } from "mongoose";

export type ExampleDocument = {
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

const exampleSchema = new Schema<ExampleDocument>(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Example = model<ExampleDocument>("Example", exampleSchema);

