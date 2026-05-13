import { sql } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/lib/db/client';
import { hasRateLimit } from '@/lib/rate-limit';

/**
 * Lightweight health check for uptime monitors.
 * GET /api/health → 200 with component status.
 *
 * Always returns 200 unless the process is on fire — components missing
 * (DB, KV) are reported in the body so the dev environment doesn't page.
 */
export async function GET() {
  const t0 = Date.now();

  let dbOk = false;
  let dbLatencyMs: number | null = null;
  if (hasDatabase) {
    const tDb = Date.now();
    try {
      await getDb().execute(sql`select 1 as ok`);
      dbOk = true;
      dbLatencyMs = Date.now() - tDb;
    } catch {
      dbOk = false;
    }
  }

  return Response.json(
    {
      status: 'ok',
      service: 'ditaket',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime_ms_since_invocation: Date.now() - t0,
      components: {
        database: {
          configured: hasDatabase,
          reachable: dbOk,
          latency_ms: dbLatencyMs,
        },
        rate_limit_cache: {
          configured: hasRateLimit,
        },
        turnstile: {
          configured: Boolean(process.env.TURNSTILE_SECRET_KEY),
        },
        admin: {
          configured: Boolean(process.env.ADMIN_PASSWORD),
        },
      },
    },
    {
      headers: {
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    },
  );
}
