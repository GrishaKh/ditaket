import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const CONTENT: Record<
  Locale,
  {
    title: string;
    leadBadge: string;
    lead: string;
    sections: { heading: string; body: string }[];
  }
> = {
  am: {
    title: 'Մեր մասին',
    leadBadge: 'ԿԸՀ-ի կողմից հավատարմագրված',
    lead:
      '«Դիտակետ»-ը 2026 թվականի ՀՀ խորհրդարանական ընտրությունների (հունիսի 7) համար Կենտրոնական ընտրական հանձնաժողովի կողմից հավատարմագրված դիտորդական առաքելություն է։ Այս կայքը մեր առաքելության մի մասն է, որի կողքին ֆիզիկապես գործում են մեր դիտորդները տեղամասերում։',
    sections: [
      {
        heading: 'Ի՞նչ ենք անում',
        body:
          'Դիտակետի դիտորդները ներկա են քվեարկության ընթացքին, իրավաբանական աջակցություն են ցուցաբերում, գրանցում են ընթացակարգային խախտումները։ Կայքը հնարավորություն է տալիս յուրաքանչյուր քաղաքացու անանուն հաղորդել խախտումներ, գտնել իր տեղամասը և հասկանալ իր իրավունքները։',
      },
      {
        heading: 'Մեր սկզբունքները',
        body:
          'Լռելյայն անանունություն — ոչ մի հաշիվ, ոչ մի հեռախոսահամար։ Թափանցիկություն — բոլոր հաղորդումները բացահայտ նշված են որպես «չստուգված»՝ մինչև մեր թիմի ստուգումը։ Չեզոքություն — Դիտակետը չի աջակցում որևէ կուսակցության կամ թեկնածուի և գործում է Հայաստանի Ընտրական օրենսգրքի շրջանակում։',
      },
      {
        heading: 'Աղբյուրներ',
        body:
          'Տեղամասային տվյալները՝ ԿԸՀ-ի պաշտոնական ռեգիստրից (elections.am, 2 005 տեղամաս)։ Ուղիղ հեռարձակումները, երբ ակտիվ լինեն, գալիս են ԿԸՀ-ի համակարգից (ինչպես կազմակերպվել է 2017 և 2021 թվականների ընտրությունների համար)։ Դիտորդների ու ԶԼՄ-ի՝ տեղամասում նկարահանելու իրավունքը՝ ՀՀ Ընտրական օրենսգիրք, Հոդված 6(12)։',
      },
      {
        heading: 'Փուլեր',
        body:
          'v1 — տեղամասերի ուղեցույց, քվեարկողի կրթություն, անանուն հաղորդումներ (հիմա)։ v2 — ԿԸՀ-ի ուղիղ հեռարձակումների ինտեգրում (հունիսի սկզբին)։ v3 — բրաուզերային AI դիտորդ՝ բաշխված համայնքային մոնիթորինգով (2027+, փորձարարական)։',
      },
      {
        heading: 'Կապ',
        body:
          'Հաղորդումները ուղարկվում են անմիջապես մեր մոդերացիայի թիմին։ Միջազգային դիտորդական մարմինների կամ լրագրողների հետ համագործակցության համար՝ contact@ditaket.am (պլանավորված)։',
      },
    ],
  },
  en: {
    title: 'About',
    leadBadge: 'Accredited by the Central Electoral Commission',
    lead:
      '«Դիտակետ» / Ditaket is an observer mission accredited by the Central Electoral Commission of Armenia for the 2026 parliamentary elections (June 7). This site is one part of the mission — our observers are also present in person at polling stations.',
    sections: [
      {
        heading: 'What we do',
        body:
          "Ditaket's observers are physically present at polling stations, provide legal support, and document procedural violations. The site lets any citizen anonymously report violations, find their station, and understand their rights.",
      },
      {
        heading: 'Our principles',
        body:
          'Anonymity by default — no accounts, no phone numbers. Transparency — every report is explicitly labelled "unverified" until our team confirms it. Neutrality — Ditaket takes no party or candidate side and operates strictly within the Armenian Electoral Code.',
      },
      {
        heading: 'Sources',
        body:
          "Station data comes from the CEC's official registry (elections.am, 2,005 stations). Live camera streams, when active, come from the CEC's system (as organised for the 2017 and 2021 elections). Observers' and media's right to record inside the polling station is set out in Article 6(12) of the RA Electoral Code.",
      },
      {
        heading: 'Phases',
        body:
          'v1 — station finder, voter education, anonymous reports (now). v2 — CEC live-stream embed (early June). v3 — browser-side AI observer with distributed community monitoring (2027+, experimental).',
      },
      {
        heading: 'Contact',
        body:
          'Reports go directly to our moderation team. For collaboration with international observation bodies or journalists: contact@ditaket.am (planned).',
      },
    ],
  },
  ru: {
    title: 'О нас',
    leadBadge: 'Аккредитована Центральной избирательной комиссией',
    lead:
      '«Դիտակետ» / Дитакет — наблюдательная миссия, аккредитованная Центральной избирательной комиссией Армении для парламентских выборов 2026 года (7 июня). Этот сайт — одна из частей миссии; наши наблюдатели также физически присутствуют на участках.',
    sections: [
      {
        heading: 'Что мы делаем',
        body:
          'Наблюдатели Дитакет физически присутствуют на участках, оказывают юридическую поддержку и фиксируют процедурные нарушения. Сайт позволяет любому гражданину анонимно сообщить о нарушении, найти свой участок и понять свои права.',
      },
      {
        heading: 'Наши принципы',
        body:
          'Анонимность по умолчанию — без аккаунтов и телефонов. Прозрачность — каждое сообщение явно отмечено как «непроверенное» до подтверждения нашей командой. Нейтральность — Дитакет не поддерживает ни одну партию или кандидата и действует строго в рамках Избирательного кодекса Армении.',
      },
      {
        heading: 'Источники',
        body:
          'Данные участков — из официального реестра ЦИК (elections.am, 2 005 участков). Прямые трансляции, когда активны, поступают из системы ЦИК (как это было организовано на выборах 2017 и 2021 годов). Право наблюдателей и СМИ на съёмку на участке закреплено в статье 6(12) Избирательного кодекса РА.',
      },
      {
        heading: 'Этапы',
        body:
          'v1 — поиск участков, образование избирателей, анонимные сообщения (сейчас). v2 — встраивание прямых трансляций ЦИК (начало июня). v3 — браузерный AI-наблюдатель с распределённым общественным мониторингом (с 2027, экспериментально).',
      },
      {
        heading: 'Контакт',
        body:
          'Сообщения поступают напрямую в нашу команду модерации. Для сотрудничества с международными наблюдательными органами и журналистами: contact@ditaket.am (планируется).',
      },
    ],
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[locale];

  return (
    <main className="container-main py-12">
      <Badge tone="orange">{c.leadBadge}</Badge>
      <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {c.title}
      </h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-navy-700">
        {c.lead}
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {c.sections.map((s) => (
          <Card key={s.heading} accent="navy">
            <h2 className="font-display text-xl font-bold text-navy-900">
              {s.heading}
            </h2>
            <p className="mt-2 max-w-prose text-navy-700">{s.body}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
