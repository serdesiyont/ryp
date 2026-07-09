import { NextRequest } from "next/server";
import {
  findCampusRatingById,
  updateCampusRating,
  removeCampusRating,
} from "@/lib/server/services/campus-rating";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const data = await findCampusRatingById(id);
    return json({ message: "Campus rating retrieved successfully", data });
  } catch (error) {
    return handleError(error, "Error retrieving campus rating");
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = await updateCampusRating(id, body);
    return json({ message: "Campus rating updated successfully", data });
  } catch (error) {
    return handleError(error, "Error updating campus rating");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const data = await removeCampusRating(id);
    return json({ message: "Campus rating deleted successfully", data });
  } catch (error) {
    return handleError(error, "Error deleting campus rating");
  }
}
