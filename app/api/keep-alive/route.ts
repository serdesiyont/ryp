import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.AUTH_BACKEND_URL!;

// Called by Vercel Cron every 10 minutes to prevent the backend from
// spinning down due to inactivity (e.g. free-tier platforms like Render).
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (or an authorised caller).
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pings = [
    { label: "lecturers", path: "/api/lecturers" },
    { label: "campuses", path: "/api/campus" },
  ];

  const results = await Promise.allSettled(
    pings.map(async ({ label, path }) => {
      const url = `${API_BASE_URL.replace(/\/$/, "")}${path}`;
      const res = await fetch(url, {
        // Don't cache — we want to actually hit the server each time.
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      return { label, status: res.status, ok: res.ok };
    })
  );

  const summary = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { label: pings[i].label, error: String((r as PromiseRejectedResult).reason) }
  );

  const allOk = results.every(
    (r) => r.status === "fulfilled" && r.value.ok
  );

  console.log("[keep-alive]", new Date().toISOString(), summary);

  return NextResponse.json(
    { success: allOk, pingedAt: new Date().toISOString(), results: summary },
    { status: allOk ? 200 : 207 }
  );
}
