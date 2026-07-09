import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { CampusRatingModel } from "@/lib/db/models/campus-rating";
import { CampusModel } from "@/lib/db/models/campus";
import { BadRequestError, NotFoundError } from "@/lib/server/http";

export interface CreateCampusRatingInput {
  campusId: string;
  reputation: number;
  social: number;
  clubs: number;
  opportunities: number;
  location: number;
  happiness: number;
  facilities: number;
  safety: number;
  internet: number;
  food: number;
  comment?: string;
}

export type UpdateCampusRatingInput = Partial<
  Omit<CreateCampusRatingInput, "campusId">
>;

const RATING_KEYS = [
  "reputation",
  "social",
  "clubs",
  "opportunities",
  "location",
  "happiness",
  "facilities",
  "safety",
  "internet",
  "food",
] as const;

export async function createCampusRating(
  input: CreateCampusRatingInput,
  userId: string
) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(input.campusId)) {
    throw new BadRequestError("Invalid campus ID format");
  }

  const rating = await CampusRatingModel.create({
    ...input,
    campusId: new Types.ObjectId(input.campusId),
    userId,
  });

  await recalculateCampusRating(input.campusId);

  return rating;
}

export async function findAllCampusRatings() {
  await connectToDatabase();
  return CampusRatingModel.find().populate("campusId", "name address").exec();
}

export async function findCampusRatingById(id: string) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid rating ID format");
  }
  const rating = await CampusRatingModel.findById(id)
    .populate("campusId", "name address")
    .exec();
  if (!rating) {
    throw new NotFoundError(`Campus rating with ID "${id}" not found`);
  }
  return rating;
}

export async function findCampusRatingsByCampus(campusId: string) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(campusId)) {
    throw new BadRequestError("Invalid campus ID format");
  }
  return CampusRatingModel.find({
    campusId: new Types.ObjectId(campusId),
  }).exec();
}

export async function findCampusRatingsByUser(userId: string) {
  await connectToDatabase();
  return CampusRatingModel.find({ userId })
    .populate("campusId", "name address")
    .exec();
}

export async function updateCampusRating(
  id: string,
  input: UpdateCampusRatingInput
) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid rating ID format");
  }
  const rating = await CampusRatingModel.findByIdAndUpdate(id, input, {
    new: true,
  })
    .populate("campusId", "name address")
    .exec();
  if (!rating) {
    throw new NotFoundError(`Campus rating with ID "${id}" not found`);
  }
  await recalculateCampusRating(rating.campusId.toString());
  return rating;
}

export async function removeCampusRating(id: string) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid rating ID format");
  }
  const rating = await CampusRatingModel.findByIdAndDelete(id).exec();
  if (!rating) {
    throw new NotFoundError(`Campus rating with ID "${id}" not found`);
  }
  await recalculateCampusRating(rating.campusId.toString());
  return rating;
}

/**
 * Recompute a campus's overallRating (average of the 10 category means) and
 * review count. Errors are swallowed so a failed recompute never breaks the
 * primary write — matching the original NestJS behaviour.
 */
async function recalculateCampusRating(campusId: string): Promise<void> {
  try {
    const campusObjectId = new Types.ObjectId(campusId);
    const ratings = await CampusRatingModel.find({
      campusId: campusObjectId,
    }).exec();

    const count = ratings.length;
    let overallRating = 0;

    if (count > 0) {
      const totalRating = ratings.reduce((sum, rating) => {
        const avgRating =
          RATING_KEYS.reduce((acc, key) => acc + (rating[key] as number), 0) /
          RATING_KEYS.length;
        return sum + avgRating;
      }, 0);
      overallRating = totalRating / count;
    }

    await CampusModel.findByIdAndUpdate(campusObjectId, {
      overallRating: Math.round(overallRating * 100) / 100,
      count,
    }).exec();
  } catch (error) {
    console.error("Error updating campus rating:", error);
  }
}
