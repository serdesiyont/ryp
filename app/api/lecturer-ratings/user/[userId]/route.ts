import { NextRequest } from "next/server";
import { findLecturerRatingsByUser } from "@/lib/server/services/lecturer-rating";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { userId } = await params;
  try {
    const data = await findLecturerRatingsByUser(userId);
    return json(data);
  } catch (error) {
    return handleError(error, "Error retrieving user ratings");
  }
}
