/**
 * Native Better Auth request handler.
 *
 * Replaces the previous cross-origin proxy to the NestJS backend. Auth now runs
 * in-process in Next.js, so all /api/auth/* requests (sign-in, sign-up,
 * get-session, verify-email, Google callback, …) are handled here directly.
 */
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/server/auth";

export const { GET, POST } = toNextJsHandler(auth);
