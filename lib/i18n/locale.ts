import type { Locale } from './routing';

export function intlLocale(locale: Locale): string {
  return locale === 'am' ? 'hy-AM' : locale;
}
