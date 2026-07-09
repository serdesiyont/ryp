import mongoose, { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const CampusRatingSchema = new Schema(
  {
    userId: { type: String, ref: "user", required: true },
    campusId: { type: Schema.Types.ObjectId, ref: "Campus", required: true },
    reputation: { type: Number, required: true },
    social: { type: Number, required: true },
    clubs: { type: Number, required: true },
    opportunities: { type: Number, required: true },
    location: { type: Number, required: true },
    happiness: { type: Number, required: true },
    facilities: { type: Number, required: true },
    safety: { type: Number, required: true },
    internet: { type: Number, required: true },
    food: { type: Number, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

export type CampusRating = InferSchemaType<typeof CampusRatingSchema> & {
  campusId: Types.ObjectId;
};

export const CampusRatingModel =
  (models.CampusRating as mongoose.Model<CampusRating>) ||
  model<CampusRating>("CampusRating", CampusRatingSchema);
