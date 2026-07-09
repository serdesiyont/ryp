import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, type Db } from "mongodb";
import { sendEmailWithGmail, type GmailConfig } from "./gmail";

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

function getEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : undefined;
}

/**
 * A single MongoClient shared across HMR reloads. Better Auth's mongodbAdapter
 * needs a `Db` handle synchronously; the native driver connects lazily on first
 * operation, so `client.db()` is safe to call at module load.
 */
declare global {
  // eslint-disable-next-line no-var
  var _authMongoDb: Db | undefined;
}

function getAuthDb(): Db {
  if (global._authMongoDb) {
    return global._authMongoDb;
  }
  const uri = getRequiredEnv("MONGO_URI");
  const client = new MongoClient(uri);
  const db = client.db();
  global._authMongoDb = db;
  return db;
}

const baseUrl =
  getEnv("BETTER_AUTH_URL") ||
  getEnv("BASE_URL") ||
  getEnv("NEXT_PUBLIC_APP_URL") ||
  "http://localhost:4000";

const emailFrom = getEnv("EMAIL_FROM") || "";
const verificationCallbackUrl =
  getEnv("VERIFICATION_CALLBACK_URL") || `${baseUrl}/`;
const trustedOrigins = getEnv("TRUSTED_ORIGINS") || baseUrl;

const gmailConfig: GmailConfig = {
  clientId: getEnv("MAIL_GOOGLE_CLIENT_ID") || "",
  clientSecret: getEnv("MAIL_GOOGLE_CLIENT_SECRET") || "",
  refreshToken: getEnv("MAIL_GOOGLE_REFRESH_TOKEN") || "",
  redirectUri: getEnv("MAIL_GOOGLE_REDIRECT_URI") || "",
  user: emailFrom,
};

const googleClientId = getEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = getEnv("GOOGLE_CLIENT_SECRET");

export const auth = betterAuth({
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  baseURL: baseUrl,
  trustedOrigins: trustedOrigins.split(",").map((o) => o.trim()).filter(Boolean),
  database: mongodbAdapter(getAuthDb()),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: ({ user, token }) => {
      const encodedCallbackURL = encodeURIComponent(verificationCallbackUrl);
      const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}&callbackURL=${encodedCallbackURL}`;

      return sendEmailWithGmail({
        gmailConfig,
        from: emailFrom,
        to: user.email,
        url: verificationUrl,
      }).then(() => undefined);
    },
    autoSignInAfterVerification: true,
  },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            redirectURI: `${baseUrl}/api/auth/callback/google`,
          },
        },
      }
    : {}),
});

/**
 * Resolve the authenticated user id from the incoming request's cookies.
 * Returns null when there is no valid session.
 */
export async function getUserId(headers: Headers): Promise<string | null> {
  const session = await auth.api.getSession({ headers });
  return session?.user?.id ?? null;
}
