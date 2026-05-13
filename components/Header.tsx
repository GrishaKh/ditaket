import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations('Nav');
  return (
    <header className="container-main flex items-center justify-between gap-4 py-5">
      <a
        href={`/${locale}`}
        className="focus-ring rounded-md"
        aria-label="«Դիտակետ» — Դիտորդական առաքելություն"
      >
        <Logo showSubtitle />
      </a>
      <div className="flex items-center gap-4 sm:gap-6">
        <nav className="hidden gap-6 text-sm font-medium text-navy-700 sm:flex">
          <a href={`/${locale}/info`} className="hover:text-navy-900">
            {t('info')}
          </a>
          <a href={`/${locale}/stats`} className="hover:text-navy-900">
            {t('stats')}
          </a>
          <a href={`/${locale}/about`} className="hover:text-navy-900">
            {t('about')}
          </a>
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
