import { createAuthClient } from "better-auth/react";

// No baseURL needed – all auth requests are proxied through /api/auth on this
// origin (app/api/auth/[...all]/route.ts). This means the browser always makes
// same-origin requests and SameSite cookie restrictions never block the cookie.
export const authClient = createAuthClient();

export function getAuthCallbackURL() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.origin}/`;
}
