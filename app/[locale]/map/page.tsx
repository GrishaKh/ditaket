import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { listGeolocatedStations, countStations } from '@/lib/stations';
import { getCommissionChair } from '@/lib/commission';
import { MapView } from '@/components/MapView';

// Coordinates come from the committed data/station-coords.json (overlaid onto
// station rows in the data layer) and grow as harvesting continues. Render at
// request time so the map reflects current data rather than freezing at build.
export const dynamic = 'force-dynamic';

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Map');
  const tStation = await getTranslations('Station');
  const tCommission = await getTranslations('Commission');

  const stations = await listGeolocatedStations(locale);
  const mapStations = stations.map((s) => ({
    ...s,
    chair: getCommissionChair(s.cecCode, locale),
  }));
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
        {mapStations.length > 0 ? (
          <MapView
            stations={mapStations}
            locale={locale}
            directionsLabel={tStation('openInMaps')}
            chairLabel={tCommission('chairLabel')}
          />
        ) : (
          <p className="text-navy-700">{t('empty')}</p>
        )}
      </div>
    </main>
  );
}
