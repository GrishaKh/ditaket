import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Locale } from '@/lib/i18n/routing';
import { getStationById, localizedCommunity } from '@/lib/stations';
import { VIOLATION_CATEGORIES } from '@/lib/violations/categories';
import { ReportForm } from '@/components/ReportForm';
import { Badge } from '@/components/ui/Badge';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: Locale; stationId: string }>;
}) {
  const { locale, stationId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Report');
  const tCommon = await getTranslations('Common');

  const station = await getStationById(stationId);
  if (!station) notFound();

  // Localize categories for the client form
  const categories = [...VIOLATION_CATEGORIES]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      id: c.id,
      label:
        locale === 'en' ? c.labelEn : locale === 'ru' ? c.labelRu : c.labelAm,
      description:
        locale === 'en'
          ? c.descriptionEn
          : locale === 'ru'
            ? c.descriptionRu
            : c.descriptionAm,
      ecArticle: c.ecArticle,
      severity: c.severity,
    }));

  return (
    <main className="container-main max-w-2xl py-12">
      <a
        href={`/${locale}/s/${stationId}`}
        className="text-sm text-navy-700 hover:text-navy-900"
      >
        ← {tCommon('back')}
      </a>

      <header className="mt-4">
        <Badge tone="navy">{station.cecCode}</Badge>
        <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-navy-700">
          {t('subtitle', {
            stationId: `${localizedCommunity(station, locale)}, №${station.stationNumber}`,
          })}
        </p>
      </header>

      <div className="mt-10">
        <ReportForm
          stationId={station.id}
          locale={locale}
          categories={categories}
        />
      </div>
    </main>
  );
}
