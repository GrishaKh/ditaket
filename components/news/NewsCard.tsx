import type { Locale } from '@/lib/i18n/routing';
import type { CecNewsItem } from '@/lib/content/cec-news';
import { formatNewsDate } from '@/lib/news/format';
import { NewsThumb } from './NewsThumb';

export function NewsCard({
  item,
  locale,
  sourceLabel,
}: {
  item: CecNewsItem;
  locale: Locale;
  sourceLabel: string;
}) {
  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-900/15 bg-cream-50 transition-shadow hover:border-navy-900/30 hover:shadow-[0_8px_30px_rgba(19,36,63,0.08)]"
    >
      <NewsThumb item={item} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-5">
        <time
          dateTime={item.date}
          className="text-xs font-semibold uppercase tracking-wide text-orange"
        >
          {formatNewsDate(item.date, locale)}
        </time>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-navy-900">
          {item.title[locale]}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-navy-700">
          {item.summary[locale]}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange">
          {sourceLabel}
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </div>
    </a>
  );
}
