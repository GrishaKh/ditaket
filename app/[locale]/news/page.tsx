import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { CEC_NEWS } from '@/lib/content/cec-news';
import { FeaturedNewsCard } from '@/components/news/FeaturedNewsCard';
import { NewsCard } from '@/components/news/NewsCard';

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('News');

  const items = CEC_NEWS;
  const featured = items.find((i) => i.featured) ?? items[0];
  const rest = items.filter((i) => i !== featured);

  return (
    <main className="container-main py-12">
      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {t('title')}
      </h1>
      <p className="mt-3 max-w-prose text-navy-700">{t('subtitle')}</p>

      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-navy-900/10 bg-cream-50 px-5 py-8 text-center text-navy-700">
          {t('empty')}
        </p>
      ) : (
        <>
          {featured ? (
            <section className="mt-10">
              <FeaturedNewsCard
                item={featured}
                locale={locale}
                featuredLabel={t('featured')}
                sourceLabel={t('source')}
                newTabLabel={t('opensNewTab')}
              />
            </section>
          ) : null}
          {rest.length > 0 ? (
            <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  sourceLabel={t('source')}
                  newTabLabel={t('opensNewTab')}
                />
              ))}
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
