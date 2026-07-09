import { NextRequest } from "next/server";
import { findCampusRatingsByUser } from "@/lib/server/services/campus-rating";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { userId } = await params;
  try {
    const data = await findCampusRatingsByUser(userId);
    return json({ message: "User ratings retrieved successfully", data });
  } catch (error) {
    return handleError(error, "Error retrieving user ratings");
  }
}
