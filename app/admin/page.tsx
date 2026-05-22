import { hasDatabase } from "@/lib/db/client";
import { VIOLATION_CATEGORIES } from "@/lib/violations/categories";
import {
  loadEvents,
  loadStatusCounts,
  loadStats,
  loadDistinctMarz,
  parseFilters,
} from "./queries";
import { AdminShell } from "./AdminShell";

// Always render fresh — the moderation queue must never be cached/prerendered.
export const dynamic = "force-dynamic";

const SOURCES = ["user_report", "ai_client", "moderator_note", "system"];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!hasDatabase) {
    return (
      <main className="min-h-screen bg-cream-50 px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl border-2 border-orange/40 bg-orange/5 p-8">
          <h1 className="font-display text-2xl font-bold text-navy-900">
            Database not configured
          </h1>
          <p className="mt-2 text-sm text-navy-700">
            Set <code className="rounded bg-navy-900/10 px-1.5 py-0.5 font-mono text-xs text-navy-900">DATABASE_URL</code>{" "}
            (Vercel Postgres / Neon) to enable the moderation queue.
          </p>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const filters = parseFilters(params);

  let events: Awaited<ReturnType<typeof loadEvents>> = [];
  let counts = { pending: 0, flagged: 0, approved: 0, rejected: 0, all: 0 };
  let stats = { todayTotal: 0, todayHighSeverity: 0, past1h: 0, withGps: 0 };
  let marzList: string[] = [];
  let loadError: string | null = null;

  try {
    [events, counts, stats, marzList] = await Promise.all([
      loadEvents(filters),
      loadStatusCounts(),
      loadStats(),
      loadDistinctMarz(),
    ]);
  } catch (e) {
    console.warn("[ditaket] admin: load failed (schema not pushed?)", e);
    loadError =
      "Failed to load events. If the schema isn't pushed yet, run `pnpm db:push` with the prod env.";
  }

  return (
    <AdminShell
      filters={filters}
      events={events}
      counts={counts}
      stats={stats}
      marzList={marzList}
      categories={VIOLATION_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.labelAm,
        labelEn: c.labelEn,
        severity: c.severity,
        ecArticle: c.ecArticle,
      }))}
      sources={SOURCES}
      loadError={loadError}
    />
  );
}
