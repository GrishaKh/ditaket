import type { Locale } from '@/lib/i18n/routing';
import type { CecNewsItem } from '@/lib/content/cec-news';
import { formatNewsDate } from '@/lib/news/format';
import { NewsThumb } from './NewsThumb';

export function FeaturedNewsCard({
  item,
  locale,
  featuredLabel,
  sourceLabel,
  newTabLabel,
}: {
  item: CecNewsItem;
  locale: Locale;
  featuredLabel: string;
  sourceLabel: string;
  newTabLabel: string;
}) {
  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring group grid overflow-hidden rounded-3xl border border-navy-900/15 bg-cream-50 transition-shadow hover:shadow-[0_12px_40px_rgba(19,36,63,0.12)] md:grid-cols-2"
    >
      <NewsThumb
        src={item.image}
        eager
        className="aspect-[16/10] md:aspect-auto md:min-h-[18rem]"
      />
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">
            <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden="true" />
            {featuredLabel}
          </span>
          <time
            dateTime={item.date}
            className="text-xs font-semibold uppercase tracking-wide text-navy-700/70"
          >
            {formatNewsDate(item.date, locale)}
          </time>
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
          {item.title[locale]}
        </h2>
        <p className="mt-3 text-navy-700">{item.summary[locale]}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-orange">
          {sourceLabel}
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
        <span className="sr-only">{newTabLabel}</span>
      </div>
    </a>
  );
}
