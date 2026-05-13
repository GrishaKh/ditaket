import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const databaseUrl =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

export const hasDatabase = Boolean(databaseUrl);

if (!hasDatabase) {
  console.warn(
    '[ditaket] DATABASE_URL / POSTGRES_URL not set — DB queries will fall back to the dev JSON fixture (data/stations.dev.json).',
  );
}

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;
let cached: DrizzleDb | null = null;

export function getDb(): DrizzleDb {
  if (cached) return cached;
  if (!hasDatabase) {
    throw new Error(
      'DATABASE_URL not configured. Set it (Vercel Postgres / Neon) to enable DB-backed queries.',
    );
  }
  const sql = neon(databaseUrl);
  cached = drizzle({ client: sql, schema, casing: 'snake_case' });
  return cached;
}

export { schema };
export type Db = DrizzleDb;
