// All backend functionality now runs natively inside this Next.js app under
// /api/*. Data endpoints therefore live on the same origin as the frontend.
//
// In the browser we use relative URLs (same-origin) so cookies are always sent.
// On the server (React Server Components / route handlers) `fetch` needs an
// absolute URL, so we resolve the app's own origin from the environment.

const API_PREFIX = "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getServerOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.API_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const port = process.env.PORT || "4000";
  return `http://localhost:${port}`;
}

export function getApiBaseUrl(): string {
  // Browser → same-origin (relative). Server → absolute self origin.
  if (typeof window !== "undefined") return "";
  return getServerOrigin();
}

function buildUrl(path: string) {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withPrefix = normalized.startsWith(`${API_PREFIX}/`)
    ? normalized
    : `${API_PREFIX}${normalized}`;
  return `${base}${withPrefix}`;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = buildUrl(path);
  // Default to no-store, but don't force it when the caller opted into Next's
  // revalidate caching (combining the two is a hard error in Next.js).
  const hasNextCache = "next" in init && init.next != null;
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
    ...(init.cache || hasNextCache ? {} : { cache: "no-store" }),
  });

  if (!response.ok) {
    const message = await safeMessage(response);
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

async function safeMessage(res: Response) {
  try {
    const body = (await res.json()) as { message?: string; error?: string };
    return body.message || body.error || `Request failed with ${res.status}`;
  } catch (err) {
    return `Request failed with ${res.status}`;
  }
}
