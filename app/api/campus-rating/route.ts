import { NextRequest } from "next/server";
import {
  createCampusRating,
  findAllCampusRatings,
} from "@/lib/server/services/campus-rating";
import { getUserId } from "@/lib/server/auth";
import { json, handleError, UnauthorizedError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await findAllCampusRatings();
    return json({ message: "Campus ratings retrieved successfully", data });
  } catch (error) {
    return handleError(error, "Error retrieving campus ratings");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request.headers);
    if (!userId) {
      throw new UnauthorizedError(
        "User must be authenticated to create a rating"
      );
    }
    const body = await request.json();
    const data = await createCampusRating(body, userId);
    return json({ message: "Campus rating created successfully", data }, 201);
  } catch (error) {
    return handleError(error, "Error creating campus rating");
  }
}
