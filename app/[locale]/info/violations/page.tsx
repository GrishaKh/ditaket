import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { VIOLATION_CATEGORIES } from '@/lib/violations/categories';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const TITLES: Record<Locale, { title: string; lead: string; severityLabel: string }> = {
  am: {
    title: 'Ի՞նչ է խախտումը',
    lead: 'Հաղորդիր այն դեպքերը, որոնք համապատասխանում են ստորև բերված կատեգորիաներին։ Յուրաքանչյուր կատեգորիա ուղղակիորեն հղվում է Հայաստանի Ընտրական օրենսգրքի համապատասխան հոդվածին։',
    severityLabel: 'Կարևորություն',
  },
  en: {
    title: 'What counts as a violation',
    lead: "Report incidents that match the categories below. Each category maps directly to an article of Armenia's Electoral Code.",
    severityLabel: 'Severity',
  },
  ru: {
    title: 'Что считается нарушением',
    lead: 'Сообщайте о случаях, подпадающих под категории ниже. Каждая категория соответствует статье Избирательного кодекса РА.',
    severityLabel: 'Серьёзность',
  },
};

export default async function ViolationsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('Nav');
  const labels = TITLES[locale];

  return (
    <main className="container-main py-12">
      <a
        href={`/${locale}/info`}
        className="text-sm text-navy-700 hover:text-navy-900"
      >
        ← {tNav('info')}
      </a>
      <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {labels.title}
      </h1>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-navy-700">
        {labels.lead}
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {[...VIOLATION_CATEGORIES]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((c) => {
            const label =
              locale === 'en'
                ? c.labelEn
                : locale === 'ru'
                  ? c.labelRu
                  : c.labelAm;
            const desc =
              locale === 'en'
                ? c.descriptionEn
                : locale === 'ru'
                  ? c.descriptionRu
                  : c.descriptionAm;
            return (
              <li key={c.id}>
                <Card accent={c.severity >= 4 ? 'orange' : 'navy'} className="h-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="navy">{c.ecArticle}</Badge>
                    <span className="text-xs text-navy-700">
                      {labels.severityLabel}: {c.severity}/5
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-lg font-bold text-navy-900">
                    {label}
                  </h2>
                  <p className="mt-2 text-sm text-navy-700">{desc}</p>
                </Card>
              </li>
            );
          })}
      </ul>
    </main>
  );
}
