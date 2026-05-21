'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter, routing, type Locale } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils';

const LABELS: Record<Locale, string> = {
  am: 'ՀԱՅ',
  en: 'EN',
  ru: 'РУС',
};

export function LanguageSwitcher({
  className,
  theme = 'light',
}: {
  className?: string;
  theme?: 'light' | 'dark';
}) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border p-1',
        theme === 'light'
          ? 'border-navy-900/15 bg-cream-50'
          : 'border-cream/20 bg-cream/5',
        className,
      )}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          onClick={() => router.replace(pathname, { locale: l })}
          className={cn(
            'focus-ring rounded-full px-3 py-1 text-xs font-semibold transition-colors',
            l === locale
              ? theme === 'light'
                ? 'bg-navy-900 text-cream'
                : 'bg-orange text-navy-950'
              : theme === 'light'
                ? 'text-navy-700 hover:bg-navy-900/5 hover:text-navy-900'
                : 'text-cream/70 hover:bg-cream/10 hover:text-cream',
          )}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
