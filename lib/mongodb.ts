import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI!;

if (!uri) throw new Error("MONGODB_URI is not defined");

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  family: 4,
};

let clientPromise: Promise<MongoClient>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectWithRetry(
  createClient: () => MongoClient,
  retries = 3,
): Promise<MongoClient> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const currentClient = createClient();

    try {
      return await currentClient.connect();
    } catch (error) {
      lastError = error;
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: string }).code)
          : "";

      const isDnsError =
        code === "EAI_AGAIN" || code === "ENOTFOUND" || code === "ESERVFAIL";

      if (!isDnsError || attempt === retries) {
        throw error;
      }

      await wait(attempt * 1000);
    }
  }

  throw lastError;
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectWithRetry(
      () => new MongoClient(uri, options),
      3,
    ).catch((error) => {
      global._mongoClientPromise = undefined;
      throw error;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = connectWithRetry(() => new MongoClient(uri, options), 3);
}

export default clientPromise;
