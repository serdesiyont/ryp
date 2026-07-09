import { createAuthClient } from "better-auth/react";

// No baseURL needed – Better Auth runs natively in this app and handles all
// /api/auth/* requests (app/api/auth/[...all]/route.ts). The browser always
// makes same-origin requests, so SameSite cookie restrictions never block the
// session cookie.
export const authClient = createAuthClient();

export function getAuthCallbackURL() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.origin}/`;
}
