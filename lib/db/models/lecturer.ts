import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const LecturerSchema = new Schema(
  {
    name: { type: String, required: true },
    university: { type: String, required: true },
    department: { type: String, required: true },
    courses: [String],
    rating: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    difficulty: { type: Number, default: 0 },
    wouldTakeAgain: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type Lecturer = InferSchemaType<typeof LecturerSchema>;

export const LecturerModel =
  (models.Lecturer as mongoose.Model<Lecturer>) ||
  model<Lecturer>("Lecturer", LecturerSchema);
