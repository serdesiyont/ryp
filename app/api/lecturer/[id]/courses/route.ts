import { NextRequest } from "next/server";
import {
  addCourseToLecturer,
  removeCourseFromLecturer,
} from "@/lib/server/services/lecturer";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { name } = await request.json();
    const data = await addCourseToLecturer(id, name);
    return json({ message: "Course added successfully", data });
  } catch (error) {
    return handleError(error, "Error adding course");
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { name } = await request.json();
    const data = await removeCourseFromLecturer(id, name);
    return json({ message: "Course removed successfully", data });
  } catch (error) {
    return handleError(error, "Error removing course");
  }
}
