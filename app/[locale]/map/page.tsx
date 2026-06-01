import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { listGeolocatedStations, countStations } from '@/lib/stations';
import { MapView } from '@/components/MapView';

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Map');
  const tStation = await getTranslations('Station');

  const stations = await listGeolocatedStations(locale);
  const total = await countStations();

  return (
    <main className="container-main py-12">
      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {t('title')}
      </h1>
      <p className="mt-2 text-navy-700">
        {t('coverage', { mapped: stations.length, total })}
      </p>

      <div className="mt-8">
        {stations.length > 0 ? (
          <MapView
            stations={stations}
            locale={locale}
            directionsLabel={tStation('openInMaps')}
          />
        ) : (
          <p className="text-navy-700">{t('empty')}</p>
        )}
      </div>
    </main>
  );
}
