import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Locale } from '@/lib/i18n/routing';
import {
  getStationById,
  localizedMarz,
  localizedCommunity,
  localizedSettlement,
} from '@/lib/stations';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default async function StationPage({
  params,
}: {
  params: Promise<{ locale: Locale; stationId: string }>;
}) {
  const { locale, stationId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Station');
  const tCommon = await getTranslations('Common');

  const station = await getStationById(stationId);
  if (!station) notFound();

  const settlement = localizedSettlement(station, locale);

  return (
    <main className="container-main py-12">
      <a
        href={`/${locale}/marz`}
        className="text-sm text-navy-700 hover:text-navy-900"
      >
        ← {t('marz')}
      </a>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="navy">{t('stationNumber')} · {station.cecCode}</Badge>
            <Badge tone="orange">ԸԸՀ {station.district}</Badge>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
            {localizedCommunity(station, locale)}
            {settlement ? <>, {settlement}</> : null}
          </h1>
          <p className="mt-2 text-navy-700">
            {t('stationNumber')}: №{station.stationNumber}
          </p>
          <p className="mt-1 text-navy-700">
            {t('marz')}:{' '}
            <a
              href={`/${locale}/marz/${encodeURIComponent(station.marz)}`}
              className="text-navy-900 underline hover:text-orange"
            >
              {localizedMarz(station, locale)}
            </a>
          </p>
          <p className="mt-1 text-navy-700">
            {t('address')}:{' '}
            <span className="text-navy-900">{station.address}</span>
          </p>
          {station.accessibility ? (
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-orange/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-700">
              {t('accessibility')}
            </p>
          ) : null}
        </div>
        <Button as="a" href={`/${locale}/report/${station.id}`}>
          {t('report')}
        </Button>
      </header>

      {/* v2 slot — CEC live stream embed lands here on election day */}
      <Card className="mt-10" accent="navy">
        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-navy-900/5 text-navy-700">
          <span className="text-sm">
            Live stream coming June 7 (CEC, Electoral Code Art. 8.11.1)
          </span>
        </div>
      </Card>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-navy-900">
          {t('events')}
        </h2>
        <p className="mt-4 text-navy-700">{t('noEvents')}</p>
        <p className="mt-4 text-xs italic text-navy-700/70">
          {tCommon('unverifiedNotice')}
        </p>
      </section>
    </main>
  );
}
