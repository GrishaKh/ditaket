import type { Locale } from '@/lib/i18n/routing';

const TAG: Record<Locale, { mission: string; accredited: string }> = {
  am: {
    mission: 'Դիտորդական առաքելություն',
    accredited: 'ԿԸՀ-ի կողմից հավատարմագրված',
  },
  en: {
    mission: 'Observer mission',
    accredited: 'Accredited by the Central Electoral Commission',
  },
  ru: {
    mission: 'Наблюдательная миссия',
    accredited: 'Аккредитована Центральной избирательной комиссией',
  },
};

const LINKS: Record<Locale, { about: string; privacy: string; terms: string }> = {
  am: { about: 'Մեր մասին', privacy: 'Գաղտնիություն', terms: 'Պայմաններ' },
  en: { about: 'About', privacy: 'Privacy', terms: 'Terms' },
  ru: { about: 'О нас', privacy: 'Конфиденциальность', terms: 'Условия' },
};

export function Footer({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();
  const tag = TAG[locale];
  const links = LINKS[locale];
  return (
    <footer className="mt-24 border-t border-navy-900/10 bg-cream-50/50">
      <div className="container-main flex flex-col gap-4 py-10 text-sm text-navy-700 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <p className="font-semibold text-navy-900">«Դիտակետ» · Ditaket</p>
          <p className="mt-1">{tag.mission}</p>
          <p className="mt-1 text-xs text-navy-700/70">{tag.accredited}</p>
          <p className="mt-3 text-xs">© {year}</p>
        </div>
        <nav className="flex gap-6">
          <a href={`/${locale}/about`} className="hover:text-navy-900">
            {links.about}
          </a>
          <a href={`/${locale}/legal/privacy`} className="hover:text-navy-900">
            {links.privacy}
          </a>
          <a href={`/${locale}/legal/terms`} className="hover:text-navy-900">
            {links.terms}
          </a>
        </nav>
      </div>
    </footer>
  );
}
