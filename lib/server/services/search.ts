import { connectToDatabase } from "@/lib/db/connect";
import { LecturerModel } from "@/lib/db/models/lecturer";
import { CampusModel } from "@/lib/db/models/campus";
import { BadRequestError } from "@/lib/server/http";

export interface SearchQuery {
  lecturerName?: string;
  campusName?: string;
}

export async function search(query: SearchQuery) {
  await connectToDatabase();

  const { lecturerName, campusName } = query;

  if (!lecturerName && !campusName) {
    throw new BadRequestError(
      "At least one search parameter (lecturerName or campusName) is required"
    );
  }

  if (campusName && !lecturerName) {
    return searchCampuses(campusName);
  }

  if (lecturerName && !campusName) {
    return searchLecturers(lecturerName);
  }

  return searchLecturersAtCampus(lecturerName!, campusName!);
}

async function searchCampuses(campusName: string) {
  try {
    const results = await CampusModel.aggregate([
      {
        $search: {
          index: "campus_search",
          text: {
            query: campusName,
            path: ["name", "address", "description"],
            fuzzy: { maxEdits: 2 },
          },
        },
      },
      { $limit: 20 },
      { $project: { _id: 1, name: 1, university: 1 } },
    ]).exec();

    return { type: "campus", query: campusName, results, count: results.length };
  } catch {
    const results = await CampusModel.find({
      $or: [
        { name: { $regex: campusName, $options: "i" } },
        { address: { $regex: campusName, $options: "i" } },
        { description: { $regex: campusName, $options: "i" } },
      ],
    })
      .select("_id name")
      .limit(20)
      .exec();

    return { type: "campus", query: campusName, results, count: results.length };
  }
}

async function searchLecturers(lecturerName: string) {
  try {
    const results = await LecturerModel.aggregate([
      {
        $search: {
          index: "lecturer_search",
          text: {
            query: lecturerName,
            path: ["name", "university", "department", "courses"],
            fuzzy: { maxEdits: 2 },
          },
        },
      },
      { $limit: 20 },
      { $project: { _id: 1, name: 1 } },
    ]).exec();

    return {
      type: "lecturer",
      query: lecturerName,
      results,
      count: results.length,
    };
  } catch {
    const results = await LecturerModel.find({
      $or: [
        { name: { $regex: lecturerName, $options: "i" } },
        { department: { $regex: lecturerName, $options: "i" } },
        { courses: { $regex: lecturerName, $options: "i" } },
      ],
    })
      .select("_id name university")
      .limit(20)
      .exec();

    return {
      type: "lecturer",
      query: lecturerName,
      results,
      count: results.length,
    };
  }
}

async function searchLecturersAtCampus(
  lecturerName: string,
  campusName: string
) {
  try {
    const results = await LecturerModel.aggregate([
      {
        $search: {
          index: "lecturer_search",
          compound: {
            must: [
              {
                text: {
                  query: lecturerName,
                  path: ["name", "department", "courses"],
                  fuzzy: { maxEdits: 2 },
                },
              },
            ],
            should: [
              {
                text: {
                  query: campusName,
                  path: "university",
                  fuzzy: { maxEdits: 1 },
                },
              },
            ],
          },
        },
      },
      { $match: { university: { $regex: campusName, $options: "i" } } },
      { $limit: 20 },
      { $project: { _id: 1, name: 1, university: 1 } },
    ]).exec();

    return {
      type: "lecturer",
      query: { lecturerName, campusName },
      results,
      count: results.length,
    };
  } catch {
    const results = await LecturerModel.find({
      university: { $regex: campusName, $options: "i" },
      $or: [
        { name: { $regex: lecturerName, $options: "i" } },
        { department: { $regex: lecturerName, $options: "i" } },
        { courses: { $regex: lecturerName, $options: "i" } },
      ],
    })
      .select("_id name university")
      .limit(20)
      .exec();

    return {
      type: "lecturer",
      query: { lecturerName, campusName },
      results,
      count: results.length,
    };
  }
}
