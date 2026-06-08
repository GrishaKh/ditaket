import type { Locale } from '@/lib/i18n/routing';

export type CecNewsItem = {
  id: number; // CEC item id, e.g. 2018
  sourceUrl: string; // https://www.elections.am/News/Item/2018
  date: string; // ISO 'YYYY-MM-DD'
  image?: string; // '/news/2018.jpg' (local) | undefined → fallback panel
  featured?: boolean; // exactly one item → hero
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
};

// Newest-first. 2026 RA parliamentary election cycle only.
export const CEC_NEWS: CecNewsItem[] = [
  {
    id: 2018,
    sourceUrl: 'https://www.elections.am/News/Item/2018',
    date: '2026-06-08',
    image: '/news/2018.jpg',
    featured: true,
    title: {
      am: 'ԿԸՀ-ն վավերացրել է քվեարկության նախնական արդյունքների արձանագրությունը',
      en: 'The CEC ratifies the protocol of preliminary voting results',
      ru: 'ЦИК утвердила протокол предварительных результатов голосования',
    },
    summary: {
      am: 'Կենտրոնական ընտրական հանձնաժողովը հաստատել է հունիսի 7-ի խորհրդարանական ընտրությունների քվեարկության նախնական արդյունքների ամփոփիչ արձանագրությունը։',
      en: 'The Central Electoral Commission approved the summary protocol of the preliminary results of the June 7 parliamentary election.',
      ru: 'Центральная избирательная комиссия утвердила итоговый протокол предварительных результатов парламентских выборов 7 июня.',
    },
  },
];
