import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations('Nav');
  const tCommon = await getTranslations('Common');

  const secondaryLinks = [
    { href: `/${locale}/live`, label: t('live') },
    { href: `/${locale}/info`, label: t('info') },
    { href: `/${locale}/map`, label: t('map') },
    { href: `/${locale}/about`, label: t('about') },
  ];
  const donateHref = `/${locale}/donate`;
  const donateLabel = t('donate');

  return (
    <header className="container-main flex items-center justify-between gap-3 py-5">
      <a
        href={`/${locale}`}
        className="focus-ring rounded-md"
        aria-label="«Դիտակետ» — Դիտորդական առաքելություն"
      >
        <Logo showSubtitle />
      </a>

      {/* Desktop cluster */}
      <div className="hidden items-center gap-6 sm:flex">
        <nav className="flex gap-6 text-sm font-medium text-navy-700">
          {secondaryLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-navy-900">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href={donateHref}
          className="focus-ring group inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-navy-950 shadow-[0_0_0_3px_rgba(232,133,42,0.18)] transition hover:bg-orange-600 hover:shadow-[0_0_0_4px_rgba(232,133,42,0.25)]"
        >
          {donateLabel}
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </a>
        <LanguageSwitcher />
      </div>

      {/* Mobile cluster */}
      <div className="flex items-center gap-2 sm:hidden">
        <a
          href={donateHref}
          className="focus-ring inline-flex items-center gap-1 rounded-full bg-orange px-3.5 py-1.5 text-xs font-semibold text-navy-950 shadow-[0_0_0_3px_rgba(232,133,42,0.18)] transition hover:bg-orange-600"
        >
          {donateLabel}
          <span aria-hidden="true">→</span>
        </a>
        <MobileMenu
          links={secondaryLinks}
          donateHref={donateHref}
          donateLabel={donateLabel}
          languageSwitcher={<LanguageSwitcher theme="dark" />}
          menuLabel={tCommon('menu')}
          closeLabel={tCommon('closeMenu')}
          taglineMission={tCommon('missionTagline')}
          taglineAccredited={tCommon('accreditedTagline')}
        />
      </div>
    </header>
  );
}
