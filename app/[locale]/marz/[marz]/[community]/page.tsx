import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import {
  listStationsInCommunity,
  localizedSettlement,
  localizedMarz,
  localizedCommunity,
} from '@/lib/stations';
import { Card } from '@/components/ui/Card';

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: Locale; marz: string; community: string }>;
}) {
  const { locale, marz, community } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Station');

  const marzName = decodeURIComponent(marz);
  const communityName = decodeURIComponent(community);
  const stations = await listStationsInCommunity(marzName, communityName);
  const sample = stations[0];

  // Group by settlement (or '_main' if none)
  const bySettlement = new Map<string, typeof stations>();
  for (const s of stations) {
    const key = s.settlement ?? '_main';
    if (!bySettlement.has(key)) bySettlement.set(key, []);
    bySettlement.get(key)!.push(s);
  }

  return (
    <main className="container-main py-12">
      <a
        href={`/${locale}/marz/${encodeURIComponent(marzName)}`}
        className="text-sm text-navy-700 hover:text-navy-900"
      >
        ← {sample ? localizedMarz(sample, locale) : marzName}
      </a>
      <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {sample ? localizedCommunity(sample, locale) : communityName}
      </h1>
      <p className="mt-2 text-navy-700">
        {stations.length} {t('stationNumber').toLowerCase()}
      </p>

      <div className="mt-10 space-y-8">
        {[...bySettlement.entries()].map(([key, list]) => {
          const settlementHeading =
            key !== '_main' ? localizedSettlement(list[0]!, locale) : null;
          return (
            <section key={key}>
              {settlementHeading ? (
                <h2 className="text-sm font-semibold uppercase tracking-widest text-orange">
                  {settlementHeading}
                </h2>
              ) : null}
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`/${locale}/s/${s.id}`}
                      className="focus-ring block"
                    >
                      <Card accent="navy" className="hover:border-orange">
                        <div className="text-xs font-semibold uppercase tracking-widest text-orange">
                          {s.cecCode}
                        </div>
                        <div className="mt-1 font-display text-lg font-bold text-navy-900">
                          №{s.stationNumber}
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm text-navy-700">
                          {s.address}
                        </div>
                      </Card>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
