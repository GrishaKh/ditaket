import { NextRequest } from 'next/server';
import { and, eq, gt, desc } from 'drizzle-orm';
import { getDb, hasDatabase, schema } from '@/lib/db/client';

/**
 * Partner-org export feed.
 * GET /api/events?since=<ISO>&marz=<...>&category=<...>&limit=<n>
 *
 * Public, read-only, no auth. Caches at edge for 30s.
 * Returns ONLY approved events (and AI events in v3) — never pending/rejected.
 */
export async function GET(req: NextRequest) {
  if (!hasDatabase) {
    return Response.json(
      { count: 0, events: [], note: 'no-db' },
      {
        headers: {
          'cache-control': 'no-store',
          'access-control-allow-origin': '*',
        },
      },
    );
  }

  const url = new URL(req.url);
  const since = url.searchParams.get('since');
  const marz = url.searchParams.get('marz');
  const category = url.searchParams.get('category');
  const limit = Math.min(
    Number.parseInt(url.searchParams.get('limit') ?? '200', 10) || 200,
    1000,
  );

  const db = getDb();
  const conditions = [eq(schema.events.moderationStatus, 'approved')];
  if (since) {
    const d = new Date(since);
    if (!Number.isNaN(d.getTime())) conditions.push(gt(schema.events.createdAt, d));
  }
  if (category) conditions.push(eq(schema.events.categoryId, category));
  if (marz) {
    // Filter by marz via station join
    const rows = await db
      .select({
        id: schema.events.id,
        stationId: schema.events.stationId,
        categoryId: schema.events.categoryId,
        description: schema.events.description,
        source: schema.events.source,
        confidence: schema.events.confidence,
        locale: schema.events.locale,
        createdAt: schema.events.createdAt,
        moderatedAt: schema.events.moderatedAt,
        marz: schema.stations.marz,
        community: schema.stations.community,
      })
      .from(schema.events)
      .innerJoin(
        schema.stations,
        eq(schema.events.stationId, schema.stations.id),
      )
      .where(and(...conditions, eq(schema.stations.marz, marz)))
      .orderBy(desc(schema.events.createdAt))
      .limit(limit);
    return jsonOk(rows);
  }

  const rows = await db
    .select({
      id: schema.events.id,
      stationId: schema.events.stationId,
      categoryId: schema.events.categoryId,
      description: schema.events.description,
      source: schema.events.source,
      confidence: schema.events.confidence,
      locale: schema.events.locale,
      createdAt: schema.events.createdAt,
      moderatedAt: schema.events.moderatedAt,
    })
    .from(schema.events)
    .where(and(...conditions))
    .orderBy(desc(schema.events.createdAt))
    .limit(limit);
  return jsonOk(rows);
}

function jsonOk(rows: unknown[]) {
  return Response.json(
    { count: rows.length, events: rows },
    {
      headers: {
        'cache-control': 'public, max-age=30, stale-while-revalidate=60',
        'access-control-allow-origin': '*',
        'content-type': 'application/json; charset=utf-8',
      },
    },
  );
}
