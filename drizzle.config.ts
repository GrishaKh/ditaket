import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      'postgres://localhost:5432/ditaket',
  },
  verbose: true,
  strict: true,
  casing: 'snake_case',
} satisfies Config;
