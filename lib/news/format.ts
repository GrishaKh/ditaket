import type { Locale } from '@/lib/i18n/routing';

function intlLocale(locale: Locale): string {
  return locale === 'am' ? 'hy-AM' : locale;
}

export function formatNewsDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
