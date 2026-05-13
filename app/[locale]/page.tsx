import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/SearchBar';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const tNav = await getTranslations('Nav');

  return (
    <main className="container-main pb-12 pt-4">
      <Badge tone="navy" dot>
        {t('openBadge')}
      </Badge>

      <h1 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
        <span className="text-navy-900">{t('heroTitleA')}</span>
        <br />
        <span className="text-orange">{t('heroTitleB')}</span>
      </h1>

      <p className="mt-6 max-w-prose text-lg leading-relaxed text-navy-700">
        {t('heroSubtitle')}
      </p>

      <div className="mt-10 max-w-2xl">
        <SearchBar
          placeholder={t('searchPlaceholder')}
          action={t('searchAction')}
        />
      </div>

      <section className="mt-24">
        <h2 className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">
          {t('howItWorksTitle')}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} accent={n === 2 ? 'orange' : 'navy'}>
              <div className="text-sm font-semibold uppercase tracking-widest text-orange">
                0{n}
              </div>
              <h3 className="mt-3 font-display text-xl font-bold text-navy-900">
                {t(`step${n}Title` as 'step1Title')}
              </h3>
              <p className="mt-2 text-navy-700">
                {t(`step${n}Body` as 'step1Body')}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-24 rounded-2xl bg-navy-900 p-8 text-cream sm:p-12">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {t('heroTitleA')} {t('heroTitleB')}
        </h2>
        <p className="mt-4 max-w-prose text-cream/80">{t('heroSubtitle')}</p>
        <Button as="a" href={`/${locale}/info/violations`} className="mt-6">
          {tNav('info')} →
        </Button>
      </section>
    </main>
  );
}
