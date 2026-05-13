import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { listCommunitiesInMarz, listMarzes } from '@/lib/stations';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';

export default async function MarzPage({
  params,
}: {
  params: Promise<{ locale: Locale; marz: string }>;
}) {
  const { locale, marz } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Station');

  const marzName = decodeURIComponent(marz);
  const [communities, marzes] = await Promise.all([
    listCommunitiesInMarz(marzName),
    listMarzes(),
  ]);

  const marzMeta = marzes.find(
    (m) =>
      m.marz === marzName ||
      m.marzEn?.toLowerCase() === marzName.toLowerCase() ||
      m.marzRu === marzName,
  );

  const displayMarz =
    locale === 'en'
      ? marzMeta?.marzEn || marzName
      : locale === 'ru'
        ? marzMeta?.marzRu || marzName
        : marzMeta?.marz || marzName;
  const totalStations = communities.reduce((acc, c) => acc + c.count, 0);

  const communityLabel = (c: {
    community: string;
    communityEn: string;
    communityRu: string;
  }) =>
    locale === 'en'
      ? c.communityEn || c.community
      : locale === 'ru'
        ? c.communityRu || c.community
        : c.community;

  return (
    <main className="container-main py-12">
      <a
        href={`/${locale}/marz`}
        className="text-sm text-navy-700 hover:text-navy-900"
      >
        ← {t('marz')}
      </a>
      <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {displayMarz}
      </h1>
      <p className="mt-2 text-navy-700">
        {communities.length} {t('community').toLowerCase()} · {totalStations}{' '}
        {t('stationNumber').toLowerCase()}
      </p>

      <section className="mt-10">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => (
            <li key={c.community}>
              <a
                href={`/${locale}/marz/${encodeURIComponent(marzMeta?.marz ?? marzName)}/${encodeURIComponent(c.community)}`}
                className="focus-ring block"
              >
                <Card accent="navy" className="hover:border-orange">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-lg font-bold text-navy-900">
                      {communityLabel(c)}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-orange">
                      {c.count}
                    </span>
                  </div>
                </Card>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
