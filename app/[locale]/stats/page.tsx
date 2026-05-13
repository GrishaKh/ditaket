import { getTranslations, setRequestLocale } from 'next-intl/server';
import { sql, eq, and } from 'drizzle-orm';
import type { Locale } from '@/lib/i18n/routing';
import { getDb, hasDatabase, schema } from '@/lib/db/client';
import { VIOLATION_CATEGORIES } from '@/lib/violations/categories';
import { Card } from '@/components/ui/Card';

export const revalidate = 60;

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('Nav');
  const tCommon = await getTranslations('Common');

  let total = 0;
  let byCategory: { categoryId: string | null; count: number }[] = [];
  let byMarz: { marz: string; count: number }[] = [];

  if (hasDatabase) {
    const db = getDb();
    const [totalRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.events)
      .where(eq(schema.events.moderationStatus, 'approved'));
    total = totalRow?.count ?? 0;

    byCategory = await db
      .select({
        categoryId: schema.events.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.events)
      .where(eq(schema.events.moderationStatus, 'approved'))
      .groupBy(schema.events.categoryId);

    byMarz = await db
      .select({
        marz: schema.stations.marz,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.events)
      .innerJoin(
        schema.stations,
        eq(schema.events.stationId, schema.stations.id),
      )
      .where(and(eq(schema.events.moderationStatus, 'approved')))
      .groupBy(schema.stations.marz);
  }

  const categoryLabelOf = (id: string | null) => {
    if (!id) return '—';
    const c = VIOLATION_CATEGORIES.find((x) => x.id === id);
    if (!c) return id;
    return locale === 'en' ? c.labelEn : locale === 'ru' ? c.labelRu : c.labelAm;
  };

  return (
    <main className="container-main py-12">
      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {tNav('stats')}
      </h1>
      <p className="mt-3 text-sm text-navy-700/70">
        {tCommon('unverifiedNotice')}
      </p>

      <section className="mt-10">
        <Card accent="orange">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
            Total approved reports
          </p>
          <p className="mt-2 font-display text-5xl font-bold text-navy-900">
            {total.toLocaleString(locale === 'en' ? 'en' : locale === 'ru' ? 'ru' : 'hy')}
          </p>
        </Card>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">
            By category
          </h2>
          <ul className="mt-4 space-y-2">
            {byCategory.length === 0 ? (
              <li className="text-navy-700">No data yet.</li>
            ) : (
              byCategory
                .sort((a, b) => b.count - a.count)
                .map((r) => (
                  <li
                    key={r.categoryId ?? 'unknown'}
                    className="flex items-baseline justify-between gap-3 rounded-lg border border-navy-900/10 bg-cream-50 px-4 py-2"
                  >
                    <span className="text-navy-900">
                      {categoryLabelOf(r.categoryId)}
                    </span>
                    <span className="font-bold tabular-nums text-orange">
                      {r.count}
                    </span>
                  </li>
                ))
            )}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">
            By region
          </h2>
          <ul className="mt-4 space-y-2">
            {byMarz.length === 0 ? (
              <li className="text-navy-700">No data yet.</li>
            ) : (
              byMarz
                .sort((a, b) => b.count - a.count)
                .map((r) => (
                  <li
                    key={r.marz}
                    className="flex items-baseline justify-between gap-3 rounded-lg border border-navy-900/10 bg-cream-50 px-4 py-2"
                  >
                    <span className="text-navy-900">{r.marz}</span>
                    <span className="font-bold tabular-nums text-orange">
                      {r.count}
                    </span>
                  </li>
                ))
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
