import { NextRequest } from "next/server";
import {
  createLecturerRating,
  findAllLecturerRatings,
} from "@/lib/server/services/lecturer-rating";
import { getUserId } from "@/lib/server/auth";
import { json, handleError, UnauthorizedError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await findAllLecturerRatings();
    return json(data);
  } catch (error) {
    return handleError(error, "Error retrieving lecturer ratings");
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
    const data = await createLecturerRating(body, userId);
    return json(data, 201);
  } catch (error) {
    return handleError(error, "Error creating lecturer rating");
  }
}
