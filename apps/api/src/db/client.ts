import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { AppBindings } from "../app-env";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;

export function createDatabase(env: AppBindings) {
  const connectionString = env.DB?.connectionString ?? env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  const client = postgres(connectionString, {
    max: 1,
    prepare: false
  });

  return drizzle(client, { schema });
}
