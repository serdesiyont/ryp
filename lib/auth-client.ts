import { createAuthClient } from "better-auth/react";

const configuredAuthUrl =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "";

function getAuthBaseUrl() {
  if (!configuredAuthUrl) {
    // For same-origin deployments, Better Auth recommends omitting baseURL.
    return undefined;
  }

  const normalized = configuredAuthUrl.replace(/\/$/, "");
  if (normalized.endsWith("/api/auth")) {
    return normalized;
  }

  return `${normalized}/api/auth`;
}

const baseURL = getAuthBaseUrl();

export const authClient = createAuthClient({
  ...(baseURL ? { baseURL } : {}),
  fetchOptions: {
    credentials: "include",
  },
});

export function getAuthCallbackURL() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.origin}/`;
}
