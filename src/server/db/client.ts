import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { env } from "@/env";
import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema>;

let _db: Database | null = null;

function getDb(): Database {
  if (!_db) {
    const sql = neon(env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export const db = new Proxy({} as Database, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});
export type DB = Database;
