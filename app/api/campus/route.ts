import { NextRequest } from "next/server";
import { createCampus, findAllCampuses } from "@/lib/server/services/campus";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await findAllCampuses();
    return json({ message: "Campuses retrieved successfully", data });
  } catch (error) {
    return handleError(error, "Error retrieving campuses");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await createCampus(body);
    return json({ message: "Campus created successfully", data }, 201);
  } catch (error) {
    return handleError(error, "Error creating campus");
  }
}
