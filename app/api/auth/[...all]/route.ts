/**
 * Auth proxy – forwards all /api/auth/* requests from the browser to the
 * external Better Auth backend server-to-server.
 *
 * WHY: Better Auth sets session cookies as SameSite=Lax. Browsers will NOT
 * send SameSite=Lax cookies on cross-origin fetch requests (only on top-level
 * navigation). So when useSession() fires a cross-origin GET /get-session, the
 * cookie is silently omitted and the server returns { session: null }.
 *
 * By proxying through the Next.js origin the browser always makes same-origin
 * requests → cookies are always included → session is always found.
 */

import { NextRequest, NextResponse } from "next/server";

// AUTH_BACKEND_URL must be the URL of your backend API server, e.g.
const BACKEND_AUTH_BASE = (process.env.AUTH_BACKEND_URL || "").replace(
  /\/$/,
  ""
);

async function authProxy(request: NextRequest): Promise<NextResponse> {
  if (!BACKEND_AUTH_BASE) {
    console.error(
      "[auth-proxy] No backend URL configured. " +
        "Set AUTH_BACKEND_URL or NEXT_PUBLIC_APP_URL."
    );
    return new NextResponse("Auth backend not configured", { status: 502 });
  }

  const { pathname, search } = request.nextUrl;

  // Forward to the same path on the backend (e.g. /api/auth/get-session)
  const targetUrl = `${BACKEND_AUTH_BASE}${pathname}${search}`;

  // Build forwarded headers – keep cookies and content headers intact
  const forwardedHeaders = new Headers(request.headers);
  // Remove hop-by-hop headers that should not be forwarded
  forwardedHeaders.delete("host");
  forwardedHeaders.delete("connection");
  forwardedHeaders.delete("transfer-encoding");
  // Tell the backend NOT to compress its response. Node's fetch() automatically
  // decompresses bodies, so if we forwarded accept-encoding the backend would
  // send gzip, Node would silently decompress it, but we'd still forward the
  // Content-Encoding: gzip header → browser gets plain JSON but tries to
  // decompress it → ERR_CONTENT_DECODING_FAILED.
  forwardedHeaders.set("accept-encoding", "identity");

  const init: RequestInit = {
    method: request.method,
    headers: forwardedHeaders,
    redirect: "manual", // let the caller handle redirects
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
    // @ts-expect-error – Node 18+ requires this flag to allow body on streams
    init.duplex = "half";
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, init);
  } catch (err) {
    console.error("[auth-proxy] upstream fetch failed:", err);
    return new NextResponse("Auth backend unreachable", { status: 502 });
  }

  const responseBody = await upstream.arrayBuffer();

  const response = new NextResponse(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
  });

  // Forward upstream response headers
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    // Skip hop-by-hop headers
    if (lower === "connection" || lower === "transfer-encoding") return;
    // Set-Cookie is handled separately below
    if (lower === "set-cookie") return;
    // Node's fetch() decompresses the body automatically, so forwarding
    // content-encoding would tell the browser to decompress already-plain text
    // → ERR_CONTENT_DECODING_FAILED. Drop it and content-length (now stale).
    if (lower === "content-encoding" || lower === "content-length") return;
    response.headers.set(key, value);
  });

  // Forward Set-Cookie headers, stripping any Domain= attribute so the
  // cookie is scoped to the frontend domain (not the backend domain).
  const setCookieHeaders: string[] =
    // Node 18.14+ exposes getSetCookie(); fall back gracefully for older envs.
    typeof (upstream.headers as any).getSetCookie === "function"
      ? (upstream.headers as any).getSetCookie()
      : upstream.headers.get("set-cookie")
      ? [upstream.headers.get("set-cookie")!]
      : [];

  for (const cookie of setCookieHeaders) {
    // Remove Domain= directive so the browser binds the cookie to the
    // frontend origin, not the backend origin.
    const sanitized = cookie.replace(/;\s*[Dd]omain=[^;]*/g, "");
    response.headers.append("set-cookie", sanitized);
  }

  return response;
}

export const GET = authProxy;
export const POST = authProxy;
export const PUT = authProxy;
export const PATCH = authProxy;
export const DELETE = authProxy;
