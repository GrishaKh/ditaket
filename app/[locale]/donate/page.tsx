import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CopyValue } from '@/components/ui/CopyValue';

// Locale-agnostic NGO requisites.
const DATA = {
  organizationAm:
    '«Համայնքի երիտասարդներ համայնքային զարգացման» հասարակական կազմակերպություն',
  tin: '05557886',
  bankAm: 'Յունիբանկ ԲԲԸ',
  account: '24103052425000',
  facebookUrl: 'https://www.facebook.com/ditaket.ditord',
  facebookLabel: 'facebook.com/ditaket.ditord',
} as const;

const PURPOSE: Record<Locale, string> = {
  am: 'Նվիրատվություն — դիտորդական առաքելություն',
  en: 'Donation — election observation mission',
  ru: 'Пожертвование — наблюдательная миссия',
};

type BankLabels = {
  organization: string;
  tin: string;
  bank: string;
  account: string;
  purpose: string;
};

type Content = {
  heroBadge: string;
  title: string;
  lead: string;
  bank: { heading: string; intro: string; labels: BankLabels };
  transparency: { heading: string; body: string };
};

const CONTENT: Record<Locale, Content> = {
  am: {
    heroBadge: 'Քո աջակցությունը կարևոր է',
    title: 'Աջակցել',
    lead:
      '«Դիտակետ»-ի գործունեությունը հնարավոր է դառնում աջակիցների շնորհիվ։ Քո նվիրատվությունն ուղղակիորեն ֆինանսավորում է դիտորդների աշխատանքը տեղամասերում, իրավաբանական աջակցությունը, ընտրությունների օրվա կապի ապահովումն ու կայքի սպասարկումը։',
    bank: {
      heading: 'Բանկային փոխանցում (ՀՀ դրամ)',
      intro: 'Հայաստանի ցանկացած բանկից կամ բանկային հավելվածից։',
      labels: {
        organization: 'Կազմակերպություն',
        tin: 'ՀՎՀՀ',
        bank: 'Բանկ',
        account: 'Հաշվեհամար',
        purpose: 'Վճարման նպատակ',
      },
    },
    transparency: {
      heading: 'Թափանցիկություն և կապ',
      body:
        '«Դիտակետ»-ը ԿԸՀ-ի կողմից հավատարմագրված դիտորդական առաքելություն է, որը գործում է Հայաստանի ընտրական օրենսգրքի շրջանակում։ Բոլոր նվիրատվություններն ուղղվում են դիտորդական գործունեության ծախսերին՝ դիտորդների ճանապարհածախսին, իրավաբանական աջակցությանը, ընտրությունների օրվա կապի ապահովմանը և կայքի սպասարկմանը։ Անդորրագրերի և ֆինանսական հարցերի դեպքում կարող ես գրել մեր Facebook-յան էջին՝',
    },
  },
  en: {
    heroBadge: 'Your support matters',
    title: 'Support',
    lead:
      "Ditaket runs on supporters. Your donation directly funds observers across polling stations, legal support, election-day communication, and the platform itself.",
    bank: {
      heading: 'Bank transfer (AMD)',
      intro: 'From any Armenian bank or mobile banking app.',
      labels: {
        organization: 'Organisation',
        tin: 'TIN (ՀՎՀՀ)',
        bank: 'Bank',
        account: 'Account',
        purpose: 'Payment purpose',
      },
    },
    transparency: {
      heading: 'Transparency & contact',
      body:
        "Ditaket is an observation mission accredited by Armenia's Central Electoral Commission and operates strictly within the Armenian Electoral Code. Every donation goes to observation work — observer travel, legal support, election-day communication, and platform operations. For receipts or financial questions, message us on Facebook:",
    },
  },
  ru: {
    heroBadge: 'Ваша поддержка важна',
    title: 'Поддержать',
    lead:
      'Работа «Дитакет» держится на сторонниках. Ваше пожертвование напрямую финансирует наблюдателей на избирательных участках, юридическую поддержку, связь в день выборов и работу платформы.',
    bank: {
      heading: 'Банковский перевод (AMD)',
      intro: 'Из любого армянского банка или мобильного приложения.',
      labels: {
        organization: 'Организация',
        tin: 'ИНН (ՀՎՀՀ)',
        bank: 'Банк',
        account: 'Счёт',
        purpose: 'Назначение платежа',
      },
    },
    transparency: {
      heading: 'Прозрачность и контакт',
      body:
        '«Дитакет» — наблюдательная миссия, аккредитованная Центральной избирательной комиссией Армении; действует строго в рамках Избирательного кодекса. Все пожертвования направляются на наблюдательную работу: командировочные расходы наблюдателей, юридическую поддержку, связь в день выборов и работу платформы. Для квитанций и финансовых вопросов пишите нам в Facebook:',
    },
  },
};

function Field({
  label,
  value,
  mono = false,
  copy = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-navy-900/5 py-2 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="shrink-0 text-sm text-navy-700 sm:w-44">{label}</dt>
      <dd className="min-w-0 break-words text-navy-900">
        {copy ? (
          <CopyValue value={value} mono={mono} />
        ) : (
          <span className={mono ? 'font-mono tracking-tight' : ''}>{value}</span>
        )}
      </dd>
    </div>
  );
}

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[locale];

  return (
    <main className="container-main py-12">
      <Badge tone="orange">{c.heroBadge}</Badge>
      <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {c.title}
      </h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-navy-700">
        {c.lead}
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card accent="navy">
          <h2 className="font-display text-xl font-bold text-navy-900">
            {c.bank.heading}
          </h2>
          <p className="mt-2 text-navy-700">{c.bank.intro}</p>
          <dl className="mt-4">
            <Field
              label={c.bank.labels.organization}
              value={DATA.organizationAm}
            />
            <Field label={c.bank.labels.tin} value={DATA.tin} mono copy />
            <Field label={c.bank.labels.bank} value={DATA.bankAm} />
            <Field
              label={c.bank.labels.account}
              value={DATA.account}
              mono
              copy
            />
            <Field label={c.bank.labels.purpose} value={PURPOSE[locale]} />
          </dl>
        </Card>

        <Card accent="orange">
          <h2 className="font-display text-xl font-bold text-navy-900">
            {c.transparency.heading}
          </h2>
          <p className="mt-2 max-w-prose text-navy-700">
            {c.transparency.body}{' '}
            <a
              href={DATA.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-orange-700 underline underline-offset-2 hover:text-orange-800"
            >
              {DATA.facebookLabel}
            </a>
          </p>
        </Card>
      </div>
    </main>
  );
}
