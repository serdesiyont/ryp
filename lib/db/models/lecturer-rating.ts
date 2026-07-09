import mongoose, { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const LecturerRatingSchema = new Schema(
  {
    lecturerId: { type: Schema.Types.ObjectId, ref: "Lecturer", required: true },
    userId: { type: String, ref: "user", required: true },
    course: { type: String, required: true },
    difficulty: { type: Number, required: true },
    wouldTakeAgain: { type: Boolean, required: true },
    quality: { type: Number, required: true },
    creditHr: { type: Number, required: true },
    grade: { type: String, required: true },
    textbook: { type: Boolean, default: false },
    comment: { type: String },
    tags: [String],
  },
  { timestamps: true }
);

export type LecturerRating = InferSchemaType<typeof LecturerRatingSchema> & {
  lecturerId: Types.ObjectId;
};

export const LecturerRatingModel =
  (models.LecturerRating as mongoose.Model<LecturerRating>) ||
  model<LecturerRating>("LecturerRating", LecturerRatingSchema);
