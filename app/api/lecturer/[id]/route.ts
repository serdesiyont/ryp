import { NextRequest } from "next/server";
import {
  findLecturerById,
  updateLecturer,
  removeLecturer,
} from "@/lib/server/services/lecturer";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const data = await findLecturerById(id);
    return json({ message: "Lecturer retrieved successfully", data });
  } catch (error) {
    return handleError(error, "Error retrieving lecturer");
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = await updateLecturer(id, body);
    return json({ message: "Lecturer updated successfully", data });
  } catch (error) {
    return handleError(error, "Error updating lecturer");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const data = await removeLecturer(id);
    return json({ message: "Lecturer deleted successfully", data });
  } catch (error) {
    return handleError(error, "Error deleting lecturer");
  }
}
