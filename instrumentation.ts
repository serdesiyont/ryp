// Force IPv4 for all outbound connections at server boot.
//
// ponytail: this machine/network advertises IPv6 (AAAA) but has no IPv6 route
// (connect → ENETUNREACH). undici's Happy-Eyeballs fallback is buggy on this
// setup: the failed IPv6 attempt also aborts the parallel IPv4 attempt, so the
// fetch times out (ETIMEDOUT). That made Better Auth's Google token exchange
// throw, surfacing to the user as `?error=invalid_code`. Forcing IPv4 (and
// disabling family autoselection) fixes the Google OAuth fetch, and also the
// MongoDB and Gmail outbound calls that hit the same wall.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setDefaultResultOrder } = await import("node:dns");
    const { setDefaultAutoSelectFamily } = await import("node:net");
    setDefaultResultOrder("ipv4first");
    setDefaultAutoSelectFamily(false);
  }
}
