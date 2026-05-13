'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter, routing, type Locale } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils';

const LABELS: Record<Locale, string> = {
  am: 'ՀԱՅ',
  en: 'EN',
  ru: 'РУС',
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-navy-900/15 bg-cream-50 p-1',
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
              ? 'bg-navy-900 text-cream'
              : 'text-navy-700 hover:bg-navy-900/5 hover:text-navy-900',
          )}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
