import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';

const CONTENT: Record<Locale, { title: string; updated: string; body: string[] }> = {
  am: {
    title: 'Գաղտնիության քաղաքականություն',
    updated: 'Թարմացված՝ 2026 թ. մայիսի 13',
    body: [
      'Դիտակետը նախագծված է անանունության սկզբունքով։ Մենք չենք պահանջում էլեկտրոնային փոստ, հեռախոսահամար կամ ցանկացած այլ նույնականացնող տեղեկատվություն հաղորդում ուղարկելու համար։',
      'Հաղորդում ուղարկելիս մենք պահում ենք միայն հաշված տվյալներ՝ տեղամասի ID, կատեգորիա, ազատ տեքստի նկարագրություն, ժամանակ և կարճ հաշված «մատնահետք» (IP-ի, բրաուզերի տեսակի և լեզվի սոլտված հաշված համարը)։ Մատնահետքը օգտագործվում է միայն կրկնակի հաղորդումները զտելու և ողողման հարձակումները կանխելու համար։',
      'IP հասցեն մեկ ժամից ոչ ավելի պահվում է Cloudflare Turnstile-ի սերվերային ստուգման համար, այնուհետև ջնջվում է։ Մենք չենք պահում երկարատև IP մատյաններ։',
      'Հաղորդումներն իրականացվում են ձեռքով մոդերացիայով, մինչև հաստատվեն և հանրությանը տեսանելի լինեն տեղամասի էջում։ Բոլոր հրապարակային հաղորդումները ուղեկցվում են «չստուգված քաղաքացիական հաղորդում» նշումով։',
      'Մենք բացատրորեն ՉԵՆՔ օգտագործում դեմքի ճանաչում, սարքերի մատնահետքավորում մարքեթինգի համար, կամ որևէ վերլուծական տրեքերներ։',
      'Հոստինգը Vercel-ում է (ԱՄՆ իրավասություն)։ Տվյալների բազան՝ Neon Postgres։ Cache-ը՝ Upstash Redis։',
      'Որևէ հարց՝ contact@ditaket.am (հեռանկարային հասցե)։',
    ],
  },
  en: {
    title: 'Privacy policy',
    updated: 'Updated 2026-05-13',
    body: [
      'Ditaket is designed around anonymity. We do not require an email, phone number, or any other identifying information to submit a report.',
      'When you submit a report, we store only minimal data: the station ID, category, free-text description, timestamp, and a short hashed "fingerprint" (a salted hash of your IP, browser type and language). The fingerprint is used only to deduplicate repeat reports and prevent flooding attacks.',
      'Your IP address is held briefly (≤ 1 hour) for Cloudflare Turnstile server verification, then discarded. We do not maintain long-term IP logs.',
      'Reports are manually moderated before becoming public on the station page. Every published report is labelled "unverified citizen report".',
      'We explicitly do NOT use facial recognition, marketing fingerprinting, or analytics trackers.',
      'Hosting: Vercel (US jurisdiction). Database: Neon Postgres. Cache: Upstash Redis.',
      'Questions: contact@ditaket.am (planned address).',
    ],
  },
  ru: {
    title: 'Политика конфиденциальности',
    updated: 'Обновлено 13.05.2026',
    body: [
      'Дитакет построен на принципе анонимности. Мы не требуем email, номер телефона или любую другую идентифицирующую информацию для подачи сообщения.',
      'При подаче сообщения мы храним только минимальные данные: ID участка, категорию, свободный текст описания, время и короткий хешированный «отпечаток» (соль-хеш от вашего IP, типа браузера и языка). Отпечаток используется только для дедупликации и защиты от флуда.',
      'IP-адрес кратковременно (≤ 1 час) хранится для проверки Cloudflare Turnstile на сервере, затем удаляется. Долговременные логи IP мы не ведём.',
      'Сообщения проходят ручную модерацию перед публикацией на странице участка. Каждое опубликованное сообщение помечено как «непроверенное гражданское сообщение».',
      'Мы явно НЕ используем распознавание лиц, маркетинговую дактилоскопию или трекеры аналитики.',
      'Хостинг: Vercel (юрисдикция США). База: Neon Postgres. Кэш: Upstash Redis.',
      'Вопросы: contact@ditaket.am (планируемый адрес).',
    ],
  },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[locale];
  return (
    <main className="container-main max-w-prose py-12">
      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {c.title}
      </h1>
      <p className="mt-2 text-xs text-navy-700/70">{c.updated}</p>
      <div className="mt-8 space-y-4 leading-relaxed text-navy-700">
        {c.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </main>
  );
}
