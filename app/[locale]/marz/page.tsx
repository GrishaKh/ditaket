import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { listMarzes, searchStations, localizedMarz } from '@/lib/stations';
import { Pill } from '@/components/ui/Pill';
import { Card } from '@/components/ui/Card';

export default async function MarzListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const tStation = await getTranslations('Station');

  const marzes = await listMarzes();
  const searchResults = q ? await searchStations(q) : [];

  const marzLabel = (m: { marz: string; marzEn: string; marzRu: string }) =>
    locale === 'en' ? m.marzEn || m.marz : locale === 'ru' ? m.marzRu || m.marz : m.marz;

  return (
    <main className="container-main py-12">
      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {tStation('marz')}
      </h1>

      {q ? (
        <section className="mt-8">
          <p className="text-navy-700">
            <span className="text-navy-900">{searchResults.length}</span> matches
            for <span className="font-semibold">"{q}"</span>
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {searchResults.map((s) => (
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
                      {locale === 'en'
                        ? s.communityEn || s.community
                        : locale === 'ru'
                          ? s.communityRu || s.community
                          : s.community}
                      , №{s.stationNumber}
                    </div>
                    <div className="mt-1 text-sm text-navy-700">{s.address}</div>
                  </Card>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-navy-900">
          {tStation('marz')} ({marzes.length})
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {marzes.map((m) => (
            <Pill
              key={m.marz}
              as="a"
              href={`/${locale}/marz/${encodeURIComponent(m.marz)}`}
            >
              {marzLabel(m)}{' '}
              <span className="ml-2 text-xs text-navy-700/60">{m.count}</span>
            </Pill>
          ))}
        </div>
      </section>
    </main>
  );
}
