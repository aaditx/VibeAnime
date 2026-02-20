import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Returns a connected MongoClient. The URI is read lazily so the module can
 * be imported at build time without MONGODB_URI being present in the env.
 */
export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not set. " +
      "Add it in Vercel → Settings → Environment Variables."
    );
  }

  if (process.env.NODE_ENV === "development") {
    // In dev, reuse the global to survive hot-reloads
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }

  // In production each module instance gets its own connection
  return new MongoClient(uri).connect();
}
