import { NextRequest } from "next/server";
import { findCampusRatingsByCampus } from "@/lib/server/services/campus-rating";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ campusId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { campusId } = await params;
  try {
    const data = await findCampusRatingsByCampus(campusId);
    return json({ message: "Campus ratings retrieved successfully", data });
  } catch (error) {
    return handleError(error, "Error retrieving campus ratings");
  }
}
