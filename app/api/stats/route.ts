import { NextRequest } from "next/server";
import { getStats } from "@/lib/server/services/stats";
import { json, handleError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const pageParam = request.nextUrl.searchParams.get("page");
    const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
    const data = await getStats(page);
    return json({ message: "Stats retrieved successfully", data });
  } catch (error) {
    return handleError(error, "Error retrieving stats");
  }
}
