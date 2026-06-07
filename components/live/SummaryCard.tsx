import type { Locale } from '@/lib/i18n/routing';
import type { LivePost } from '@/lib/db/schema';
import { pickContent, formatTime } from '@/lib/live/format';
import { CounterCards } from './CounterCards';

type Labels = {
  issuesTitle: string;
  casesTitle: string;
  nextLabel: string;
  badge: string;
};

export function SummaryCard({
  post,
  locale,
  labels,
}: {
  post: LivePost;
  locale: Locale;
  labels: Labels;
}) {
  const c = pickContent(post.content, locale);
  const time = formatTime(post.asOf ?? post.publishedAt, locale);
  return (
    <article className="overflow-hidden rounded-3xl border border-navy-900/10 bg-cream-50 shadow-sm">
      <div className="flex items-center justify-between gap-3 bg-navy-900 px-6 py-4 text-cream-50">
        <span className="inline-flex items-center gap-2 rounded-full bg-orange px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-950">
          {c.badge ?? labels.badge}
        </span>
        <span className="text-sm font-semibold tabular-nums">{time}</span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl font-bold text-navy-900">
          {c.title}
        </h3>
        {c.intro ? (
          <p className="mt-3 whitespace-pre-line text-navy-700">{c.intro}</p>
        ) : null}
        {c.highlight ? (
          <div className="mt-4 rounded-2xl bg-navy-900 px-5 py-4 text-cream-50">
            <p className="whitespace-pre-line text-sm leading-relaxed">
              {c.highlight}
            </p>
          </div>
        ) : null}
        {post.counters?.length ? (
          <div className="mt-6">
            <CounterCards counters={post.counters} locale={locale} variant="compact" />
          </div>
        ) : null}
        {c.issues?.length ? (
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
              {labels.issuesTitle}
            </h4>
            <ul className="mt-3 space-y-2">
              {c.issues.map((it, i) => (
                <li key={i} className="flex gap-2 text-sm text-navy-800">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange"
                    aria-hidden
                  />
                  <span className="whitespace-pre-line">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {c.cases?.length ? (
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
              {labels.casesTitle}
            </h4>
            <ul className="mt-3 space-y-3">
              {c.cases.map((cs, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-navy-900/10 bg-cream-100 p-3"
                >
                  {cs.stations ? (
                    <span className="mr-2 inline-block rounded-md bg-navy-900/10 px-2 py-0.5 text-xs font-bold tabular-nums text-navy-900">
                      {cs.stations}
                    </span>
                  ) : null}
                  <span className="text-sm text-navy-800">{cs.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {c.nextNote ? (
          <div className="mt-6 rounded-xl border-l-4 border-orange bg-orange/5 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange">
              {labels.nextLabel}
            </span>
            <p className="mt-1 whitespace-pre-line text-sm text-navy-800">
              {c.nextNote}
            </p>
          </div>
        ) : null}
        {c.hashtags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {c.hashtags.map((h, i) => (
              <span
                key={i}
                className="rounded-full bg-navy-900/5 px-3 py-1 text-xs font-medium text-navy-700"
              >
                #{h}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
