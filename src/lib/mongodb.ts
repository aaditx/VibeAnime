import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Module-scoped variables to hold the client and promise across hot reloads and serverless invocations
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

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
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production, use the module-scoped variable so warm serverless functions reuse the connection pool
    if (!clientPromise) {
      client = new MongoClient(uri);
      clientPromise = client.connect();
    }
  }

  return clientPromise;
}
