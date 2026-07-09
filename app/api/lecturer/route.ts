import { NextRequest } from "next/server";
import {
  createLecturer,
  findAllLecturers,
} from "@/lib/server/services/lecturer";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await findAllLecturers();
    return json({ message: "Lecturers retrieved successfully", data });
  } catch (error) {
    return handleError(error, "Error retrieving lecturers");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await createLecturer(body);
    return json({ message: "Lecturer created successfully", data }, 201);
  } catch (error) {
    return handleError(error, "Error creating lecturer");
  }
}
