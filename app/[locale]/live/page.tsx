import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { loadLivePosts, latestCounters } from '@/lib/live/queries';
import { formatTime } from '@/lib/live/format';
import { CounterCards } from '@/components/live/CounterCards';
import { SummaryCard } from '@/components/live/SummaryCard';
import { FlashCard } from '@/components/live/FlashCard';
import { AutoRefresh } from '@/components/live/AutoRefresh';

export const revalidate = 30;

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Live');

  const posts = await loadLivePosts();
  const latest = latestCounters(posts);
  const labels = {
    issuesTitle: t('issuesTitle'),
    casesTitle: t('casesTitle'),
    nextLabel: t('nextLabel'),
    badge: t('badge'),
  };

  return (
    <main className="container-main py-12">
      <AutoRefresh intervalMs={30000} />

      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {t('title')}
      </h1>
      <p className="mt-3 text-navy-700">{t('subtitle')}</p>
      <p className="mt-2 text-sm text-navy-700/70">{t('disclaimer')}</p>

      {latest ? (
        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-navy-900">
              {t('dashboardTitle')}
            </h2>
            <span className="text-sm text-navy-700/70">
              {formatTime(latest.asOf, locale)} {t('asOf')}
            </span>
          </div>
          <div className="mt-4">
            <CounterCards counters={latest.counters} locale={locale} />
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-navy-900">
          {t('feedTitle')}
        </h2>
        {posts.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-navy-900/10 bg-cream-50 px-5 py-8 text-center text-navy-700">
            {t('empty')}
          </p>
        ) : (
          <div className="mt-6 space-y-8">
            {posts.map((p) =>
              p.kind === 'flash' ? (
                <FlashCard key={p.id} post={p} locale={locale} />
              ) : (
                <SummaryCard key={p.id} post={p} locale={locale} labels={labels} />
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}
