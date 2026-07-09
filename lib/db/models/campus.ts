import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const CampusSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String },
    overallRating: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type Campus = InferSchemaType<typeof CampusSchema>;

export const CampusModel =
  (models.Campus as mongoose.Model<Campus>) ||
  model<Campus>("Campus", CampusSchema);
