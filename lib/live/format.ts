import type { Locale } from '@/lib/i18n/routing';
import { intlLocale } from '@/lib/i18n/locale';
import type { LiveCounter, LivePostContent, SummaryContent } from './types';

const EMPTY: SummaryContent = { title: '' };

export function pickContent(
  content: LivePostContent | null | undefined,
  locale: Locale,
): SummaryContent {
  if (!content) return EMPTY;
  return content[locale] ?? content.am ?? EMPTY;
}

export function counterLabel(c: LiveCounter, locale: Locale): string {
  if (locale === 'en') return c.labelEn ?? c.labelAm;
  if (locale === 'ru') return c.labelRu ?? c.labelAm;
  return c.labelAm;
}

export function formatTime(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    // Pin Armenia time: the page renders server-side (Vercel = UTC), so without
    // an explicit zone "13:00" would display as the UTC hour.
    timeZone: 'Asia/Yerevan',
  }).format(d);
}

export function formatCount(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(n);
}
