import { NextRequest } from "next/server";
import { search } from "@/lib/server/services/search";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lecturerName = searchParams.get("lecturerName") ?? undefined;
  const campusName = searchParams.get("campusName") ?? undefined;

  try {
    const data = await search({ lecturerName, campusName });
    return json(data);
  } catch (error) {
    return handleError(error, "Error performing search");
  }
}
