import type { Locale } from '@/lib/i18n/routing';
import type { LivePost } from '@/lib/db/schema';
import { pickContent, formatTime } from '@/lib/live/format';

export function FlashCard({
  post,
  locale,
}: {
  post: LivePost;
  locale: Locale;
}) {
  const c = pickContent(post.content, locale);
  const time = formatTime(post.asOf ?? post.publishedAt, locale);
  return (
    <article className="flex gap-4 rounded-2xl border border-navy-900/10 bg-cream-50 px-5 py-4">
      <span className="shrink-0 pt-0.5 text-sm font-bold tabular-nums text-orange">
        {time}
      </span>
      <div>
        <h3 className="font-semibold text-navy-900">{c.title}</h3>
        {c.intro ? (
          <p className="mt-1 whitespace-pre-line text-sm text-navy-700">
            {c.intro}
          </p>
        ) : null}
      </div>
    </article>
  );
}
