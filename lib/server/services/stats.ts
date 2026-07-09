import { connectToDatabase } from "@/lib/db/connect";
import { CampusModel } from "@/lib/db/models/campus";
import { LecturerModel } from "@/lib/db/models/lecturer";
import { CampusRatingModel } from "@/lib/db/models/campus-rating";
import { LecturerRatingModel } from "@/lib/db/models/lecturer-rating";

export async function getStats(page = 1) {
  await connectToDatabase();

  const limit = 3;
  const skip = (page - 1) * limit;

  const [
    campusCount,
    lecturerCount,
    campusRatingCount,
    lecturerRatingCount,
    topCampuses,
    latestLecturerReviews,
    totalLecturerReviews,
  ] = await Promise.all([
    CampusModel.countDocuments().exec(),
    LecturerModel.countDocuments().exec(),
    CampusRatingModel.countDocuments().exec(),
    LecturerRatingModel.countDocuments().exec(),
    CampusModel.find().sort({ count: -1 }).limit(4).exec(),
    LecturerRatingModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("lecturerId", "name university department")
      .exec(),
    LecturerRatingModel.countDocuments().exec(),
  ]);

  return {
    campusCount,
    lecturerCount,
    totalReviews: campusRatingCount + lecturerRatingCount,
    topRatedCampuses: topCampuses,
    latestLecturerReviews: {
      data: latestLecturerReviews,
      pagination: {
        page,
        limit,
        total: totalLecturerReviews,
        totalPages: Math.ceil(totalLecturerReviews / limit),
      },
    },
  };
}
