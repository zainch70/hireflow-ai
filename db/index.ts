import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Drizzle database client.
 * Schemas will be defined in /db/schema — none yet.
 *
 * Lazy init so the app can boot before DATABASE_URL is configured.
 */
function createDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // prepare: false is recommended for Supabase connection pooling
  const client = postgres(connectionString, { prepare: false });

  return drizzle(client, { schema });
}

type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as { __db?: Db };

export const db: Db =
  globalForDb.__db ??
  new Proxy({} as Db, {
    get(_target, property, receiver) {
      const instance = (globalForDb.__db ??= createDb());
      return Reflect.get(instance, property, receiver);
    },
  });
