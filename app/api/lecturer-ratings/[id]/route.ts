import { NextRequest } from "next/server";
import {
  findLecturerRatingById,
  updateLecturerRating,
  removeLecturerRating,
} from "@/lib/server/services/lecturer-rating";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const data = await findLecturerRatingById(id);
    return json(data);
  } catch (error) {
    return handleError(error, "Error retrieving lecturer rating");
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = await updateLecturerRating(id, body);
    return json(data);
  } catch (error) {
    return handleError(error, "Error updating lecturer rating");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const data = await removeLecturerRating(id);
    return json(data);
  } catch (error) {
    return handleError(error, "Error deleting lecturer rating");
  }
}
