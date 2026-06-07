import type { Locale } from '@/lib/i18n/routing';
import type { LiveCounter } from '@/lib/live/types';
import { counterLabel, formatCount } from '@/lib/live/format';

export function CounterCards({
  counters,
  locale,
  variant = 'dashboard',
}: {
  counters: LiveCounter[];
  locale: Locale;
  variant?: 'dashboard' | 'compact';
}) {
  if (!counters.length) return null;
  return (
    <div
      className={
        variant === 'dashboard'
          ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid gap-3 sm:grid-cols-3'
      }
    >
      {counters.map((c) => (
        <div
          key={c.id}
          className="rounded-2xl border border-navy-900/10 bg-cream-50 p-5"
        >
          {c.icon ? (
            <div className="text-2xl" aria-hidden>
              {c.icon}
            </div>
          ) : null}
          <div className="mt-1 font-display text-4xl font-bold tabular-nums text-navy-900">
            {formatCount(c.value, locale)}
          </div>
          <div className="mt-1 text-sm font-medium text-navy-700">
            {counterLabel(c, locale)}
          </div>
          {c.note ? (
            <div className="mt-0.5 text-xs text-navy-700/70">{c.note}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
