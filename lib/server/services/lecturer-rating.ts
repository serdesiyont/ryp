import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { LecturerRatingModel } from "@/lib/db/models/lecturer-rating";
import { LecturerModel } from "@/lib/db/models/lecturer";
import { BadRequestError, NotFoundError } from "@/lib/server/http";

export interface CreateLecturerRatingInput {
  lecturerId: string;
  course: string;
  difficulty: number;
  wouldTakeAgain: boolean;
  quality: number;
  creditHr: number;
  grade: string;
  textbook: boolean;
  comment?: string;
  tags?: string[];
}

export type UpdateLecturerRatingInput = Partial<
  Omit<CreateLecturerRatingInput, "lecturerId">
>;

export async function createLecturerRating(
  input: CreateLecturerRatingInput,
  userId: string
) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(input.lecturerId)) {
    throw new BadRequestError("Invalid lecturer ID format");
  }

  const lecturerId = new Types.ObjectId(input.lecturerId);

  const rating = await LecturerRatingModel.create({
    ...input,
    lecturerId,
    userId,
  });

  await recalculateLecturerRating(lecturerId);

  return rating;
}

export async function findAllLecturerRatings() {
  await connectToDatabase();
  return LecturerRatingModel.find().populate("lecturerId").exec();
}

export async function findLecturerRatingById(id: string) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid rating ID format");
  }
  const rating = await LecturerRatingModel.findById(id)
    .populate("lecturerId")
    .exec();
  if (!rating) {
    throw new NotFoundError(`Lecturer rating with ID ${id} not found`);
  }
  return rating;
}

export async function findLecturerRatingsByLecturer(lecturerId: string) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(lecturerId)) {
    throw new BadRequestError("Invalid lecturer ID format");
  }
  return LecturerRatingModel.find({
    lecturerId: new Types.ObjectId(lecturerId),
  }).exec();
}

export async function findLecturerRatingsByUser(userId: string) {
  await connectToDatabase();
  return LecturerRatingModel.find({ userId }).populate("lecturerId").exec();
}

export async function updateLecturerRating(
  id: string,
  input: UpdateLecturerRatingInput
) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid rating ID format");
  }
  const rating = await LecturerRatingModel.findByIdAndUpdate(id, input, {
    new: true,
  })
    .populate("lecturerId")
    .exec();
  if (!rating) {
    throw new NotFoundError(`Lecturer rating with ID ${id} not found`);
  }
  await recalculateLecturerRating(rating.lecturerId);
  return rating;
}

export async function removeLecturerRating(id: string) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid rating ID format");
  }
  const rating = await LecturerRatingModel.findByIdAndDelete(id).exec();
  if (!rating) {
    throw new NotFoundError(`Lecturer rating with ID ${id} not found`);
  }
  await recalculateLecturerRating(rating.lecturerId);
  return rating;
}

/**
 * Recompute a lecturer's aggregate rating (mean of difficulty+quality),
 * average difficulty, wouldTakeAgain percentage and review count. Errors are
 * swallowed so a failed recompute never breaks the primary write.
 */
async function recalculateLecturerRating(
  lecturerId: Types.ObjectId
): Promise<void> {
  try {
    const ratings = await LecturerRatingModel.find({ lecturerId }).exec();

    if (ratings.length === 0) {
      await LecturerModel.findByIdAndUpdate(lecturerId, {
        rating: 0,
        count: 0,
        difficulty: 0,
        wouldTakeAgain: 0,
      }).exec();
      return;
    }

    const totalRating = ratings.reduce(
      (sum, rating) => sum + (rating.difficulty + rating.quality) / 2,
      0
    );
    const totalDifficulty = ratings.reduce(
      (sum, rating) => sum + rating.difficulty,
      0
    );
    const wouldTakeAgainCount = ratings.filter(
      (rating) => rating.wouldTakeAgain === true
    ).length;
    const wouldTakeAgainPercentage =
      (wouldTakeAgainCount / ratings.length) * 100;

    const roundedRating =
      Math.round((totalRating / ratings.length) * 100) / 100;
    const roundedDifficulty =
      Math.round((totalDifficulty / ratings.length) * 100) / 100;
    const roundedWouldTakeAgain =
      Math.round(wouldTakeAgainPercentage * 100) / 100;

    await LecturerModel.findByIdAndUpdate(lecturerId, {
      rating: roundedRating,
      count: ratings.length,
      difficulty: roundedDifficulty,
      wouldTakeAgain: roundedWouldTakeAgain,
    }).exec();
  } catch (error) {
    console.error("Error updating lecturer rating:", error);
  }
}
