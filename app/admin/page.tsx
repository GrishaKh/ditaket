import { desc, eq } from 'drizzle-orm';
import { getDb, hasDatabase, schema } from '@/lib/db/client';
import { VIOLATION_CATEGORIES } from '@/lib/violations/categories';
import { ModerationRow } from './ModerationRow';

// Always render fresh — the moderation queue must never be cached/prerendered.
export const dynamic = 'force-dynamic';

const CATEGORY_LABEL_BY_ID = new Map<
  string,
  (typeof VIOLATION_CATEGORIES)[number]
>(VIOLATION_CATEGORIES.map((c) => [c.id, c]));

type PendingRow = {
  id: string;
  stationId: string;
  categoryId: string | null;
  description: string;
  source: string;
  locale: string;
  createdAt: Date;
  reporterFingerprint: string;
  marz: string | null;
  community: string | null;
  address: string | null;
  stationNumber: string | null;
};

async function loadPending(): Promise<PendingRow[]> {
  const db = getDb();
  try {
    return await db
      .select({
        id: schema.events.id,
        stationId: schema.events.stationId,
        categoryId: schema.events.categoryId,
        description: schema.events.description,
        source: schema.events.source,
        locale: schema.events.locale,
        createdAt: schema.events.createdAt,
        reporterFingerprint: schema.events.reporterFingerprint,
        marz: schema.stations.marz,
        community: schema.stations.community,
        address: schema.stations.address,
        stationNumber: schema.stations.stationNumber,
      })
      .from(schema.events)
      .leftJoin(
        schema.stations,
        eq(schema.events.stationId, schema.stations.id),
      )
      .where(eq(schema.events.moderationStatus, 'pending'))
      .orderBy(desc(schema.events.createdAt))
      .limit(100);
  } catch (e) {
    console.warn(
      '[ditaket] admin: pending query failed (schema not pushed?)',
      e,
    );
    return [];
  }
}

export default async function AdminPage() {
  if (!hasDatabase) {
    return (
      <main className="container-main py-12">
        <h1 className="font-display text-3xl font-bold text-navy-900">
          Moderation queue
        </h1>
        <p className="mt-4 rounded-lg border border-orange/40 bg-orange/5 p-4 text-navy-900">
          Database not configured — set <code>DATABASE_URL</code> to use the
          moderation queue.
        </p>
      </main>
    );
  }

  const pending = await loadPending();

  return (
    <main className="container-main py-12">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-900">
            Moderation queue
          </h1>
          <p className="mt-1 text-sm text-navy-700">
            {pending.length} pending{' '}
            {pending.length === 1 ? 'report' : 'reports'}
          </p>
        </div>
        <a
          href="/api/events"
          className="text-sm text-navy-700 underline hover:text-orange"
        >
          /api/events →
        </a>
      </header>

      {pending.length === 0 ? (
        <p className="mt-12 text-navy-700">
          No pending reports. (If the schema isn&apos;t pushed yet, run{' '}
          <code>pnpm db:push</code> locally with the prod env.)
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {pending.map((row) => {
            const cat = row.categoryId
              ? CATEGORY_LABEL_BY_ID.get(row.categoryId)
              : undefined;
            return (
              <ModerationRow
                key={row.id}
                event={{
                  id: row.id,
                  stationId: row.stationId,
                  categoryId: row.categoryId,
                  categoryLabel: cat?.labelAm ?? row.categoryId ?? '—',
                  ecArticle: cat?.ecArticle ?? '',
                  severity: cat?.severity ?? 0,
                  description: row.description,
                  source: row.source,
                  locale: row.locale,
                  createdAt: row.createdAt.toISOString(),
                  marz: row.marz ?? '',
                  community: row.community ?? '',
                  address: row.address ?? '',
                  stationNumber: row.stationNumber ?? '',
                  reporterFingerprint: row.reporterFingerprint,
                }}
              />
            );
          })}
        </ul>
      )}
    </main>
  );
}
