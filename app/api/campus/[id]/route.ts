import { NextRequest } from "next/server";
import {
  findCampusById,
  updateCampus,
  removeCampus,
} from "@/lib/server/services/campus";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const data = await findCampusById(id);
    return json({ message: "Campus retrieved successfully", data });
  } catch (error) {
    return handleError(error, "Error retrieving campus");
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = await updateCampus(id, body);
    return json({ message: "Campus updated successfully", data });
  } catch (error) {
    return handleError(error, "Error updating campus");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const data = await removeCampus(id);
    return json({ message: "Campus deleted successfully", data });
  } catch (error) {
    return handleError(error, "Error deleting campus");
  }
}
