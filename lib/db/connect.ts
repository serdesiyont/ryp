import mongoose from "mongoose";

/**
 * Cached Mongoose connection.
 *
 * Next.js (in dev with HMR, and in serverless environments) re-evaluates
 * modules frequently. Without caching we would open a new MongoDB connection
 * on every request / reload and quickly exhaust the connection pool. We stash
 * the connection promise on the global object so it survives module reloads.
 */

const MONGO_URI = process.env.MONGO_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache =
  global._mongooseCache ?? (global._mongooseCache = { conn: null, promise: null });

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!MONGO_URI || !MONGO_URI.trim()) {
    throw new Error("Missing required environment variable: MONGO_URI");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGO_URI.trim(), {
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
