import { NextRequest } from "next/server";
import { findLecturerRatingsByLecturer } from "@/lib/server/services/lecturer-rating";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ lecturerId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { lecturerId } = await params;
  try {
    const data = await findLecturerRatingsByLecturer(lecturerId);
    return json(data);
  } catch (error) {
    return handleError(error, "Error retrieving lecturer ratings");
  }
}
