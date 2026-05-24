import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CopyValue } from '@/components/ui/CopyValue';

// Locale-agnostic NGO requisites. Values starting with `TODO_` are rendered as
// styled "coming soon" placeholders until the user confirms them.
const DATA = {
  organizationAm:
    '«Համայնքի երիտասարդներ համայնքային զարգացման» հասարակական կազմակերպություն',
  organizationLatin: 'TODO_BENEFICIARY_LATIN',
  tin: '05557886',
  addressAm:
    'ՀՀ, Շիրակի մարզ, ք. Արթիկ, Նոր կյանք 10 փակ., տուն 1',
  addressLatin: 'TODO_ADDRESS_LATIN',
  bankAm: 'Յունիբանկ ԲԲԸ',
  bankLatin: 'TODO_BANK_LATIN',
  bankAddress: 'TODO_BANK_ADDRESS',
  swift: 'TODO_SWIFT',
  account: '24103052425000',
  idram: 'TODO_IDRAM',
  easypay: 'TODO_EASYPAY',
  facebookUrl: 'https://www.facebook.com/ditaket.ditord',
  facebookLabel: 'facebook.com/ditaket.ditord',
} as const;

const PURPOSE: Record<Locale, string> = {
  am: 'Նվիրատվություն — դիտորդական առաքելություն',
  en: 'Donation — election observation mission',
  ru: 'Пожертвование — наблюдательная миссия',
};

const PENDING_LABEL: Record<Locale, string> = {
  am: '(կտրամադրվի շուտով)',
  en: '(coming soon)',
  ru: '(скоро будет добавлено)',
};

const COMING_SOON: Record<Locale, string> = {
  am: 'Շուտով',
  en: 'Coming soon',
  ru: 'Скоро',
};

type BankLabels = {
  organization: string;
  tin: string;
  bank: string;
  account: string;
  purpose: string;
};

type SwiftLabels = {
  beneficiary: string;
  beneficiaryAddress: string;
  account: string;
  tin: string;
  bank: string;
  bankAddress: string;
  swift: string;
  purpose: string;
};

type WalletLabels = {
  idram: string;
  easypay: string;
};

type Content = {
  heroBadge: string;
  title: string;
  lead: string;
  bank: { heading: string; intro: string; labels: BankLabels };
  swift: { heading: string; intro: string; labels: SwiftLabels };
  wallets: { heading: string; intro: string; labels: WalletLabels };
  transparency: { heading: string; body: string };
};

const CONTENT: Record<Locale, Content> = {
  am: {
    heroBadge: 'Քո աջակցությունը կարևոր է',
    title: 'Աջակցել',
    lead:
      '«Դիտակետ»-ի գործունեությունը հնարավոր է դառնում աջակիցների շնորհիվ։ Քո նվիրատվությունն ուղղակիորեն ֆինանսավորում է դիտորդների աշխատանքը 2005 տեղամասերում, իրավաբանական աջակցությունը, ընտրությունների օրվա կապի ապահովումն ու կայքի սպասարկումը։',
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
    swift: {
      heading: 'Արտերկրյա փոխանցում (SWIFT)',
      intro:
        'Հայաստանից դուրս փոխանցումների համար (USD, EUR և այլն)։ Կոնկրետ արժույթի և թղթակից բանկի մանրամասների համար խորհրդակցիր քո բանկի հետ։',
      labels: {
        beneficiary: 'Ստացող (Beneficiary)',
        beneficiaryAddress: 'Ստացողի հասցե',
        account: 'Հաշվեհամար (IBAN/Account)',
        tin: 'ՀՎՀՀ (TIN)',
        bank: 'Ստացողի բանկ',
        bankAddress: 'Բանկի հասցե',
        swift: 'SWIFT / BIC',
        purpose: 'Վճարման նպատակ',
      },
    },
    wallets: {
      heading: 'Հայաստանյան էլ. դրամապանակներ',
      intro: 'Արագ փոխանցում բջջային հավելվածից։',
      labels: {
        idram: 'IDram ID',
        easypay: 'EasyPay հաշիվ',
      },
    },
    transparency: {
      heading: 'Թափանցիկություն և կապ',
      body:
        '«Դիտակետ»-ը ԿԸՀ-ի կողմից հավատարմագրված դիտորդական առաքելություն է, որը գործում է Հայաստանի ընտրական օրենսգրքի շրջանակում։ Բոլոր նվիրատվություններն ուղղվում են դիտորդական գործունեության ծախսերին՝ դիտորդների ճանապարհածախսին, իրավաբանական աջակցությանը, ընտրությունների օրվա կապի ապահովմանը և կայքի սպասարկմանը։ Անդորրագրի կամ ֆինանսական հարցերի դեպքում գրիր մեզ Facebook-ով՝',
    },
  },
  en: {
    heroBadge: 'Your support matters',
    title: 'Support',
    lead:
      "Ditaket runs on supporters. Your donation directly funds observers across 2,005 polling stations, legal support, election-day communication, and the platform itself.",
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
    swift: {
      heading: 'International wire (SWIFT)',
      intro:
        'For transfers from outside Armenia (USD, EUR, etc.). Confirm currency and correspondent-bank details with your sending bank.',
      labels: {
        beneficiary: 'Beneficiary',
        beneficiaryAddress: 'Beneficiary address',
        account: 'Account (IBAN)',
        tin: 'TIN',
        bank: 'Beneficiary bank',
        bankAddress: 'Bank address',
        swift: 'SWIFT / BIC',
        purpose: 'Payment purpose',
      },
    },
    wallets: {
      heading: 'Armenian digital wallets',
      intro: 'Fast transfers from a mobile app.',
      labels: {
        idram: 'IDram ID',
        easypay: 'EasyPay account',
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
      'Работа «Дитакет» держится на сторонниках. Ваше пожертвование напрямую финансирует наблюдателей на 2 005 избирательных участках, юридическую поддержку, связь в день выборов и работу платформы.',
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
    swift: {
      heading: 'Международный перевод (SWIFT)',
      intro:
        'Для переводов из-за рубежа (USD, EUR и др.). Валюту и реквизиты банка-корреспондента уточните у банка-отправителя.',
      labels: {
        beneficiary: 'Получатель (Beneficiary)',
        beneficiaryAddress: 'Адрес получателя',
        account: 'Счёт (IBAN)',
        tin: 'ИНН (TIN)',
        bank: 'Банк бенефициара',
        bankAddress: 'Адрес банка',
        swift: 'SWIFT / BIC',
        purpose: 'Назначение платежа',
      },
    },
    wallets: {
      heading: 'Армянские электронные кошельки',
      intro: 'Быстрый перевод из мобильного приложения.',
      labels: {
        idram: 'IDram ID',
        easypay: 'Счёт EasyPay',
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
  locale,
  mono = false,
  copy = false,
}: {
  label: string;
  value: string;
  locale: Locale;
  mono?: boolean;
  copy?: boolean;
}) {
  const pending = value.startsWith('TODO_');
  return (
    <div className="flex flex-col gap-0.5 border-b border-navy-900/5 py-2 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="shrink-0 text-sm text-navy-700 sm:w-44">{label}</dt>
      <dd className="min-w-0 break-words text-navy-900">
        {pending ? (
          <span className="italic text-orange-700">
            {PENDING_LABEL[locale]}
          </span>
        ) : copy ? (
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
              locale={locale}
              label={c.bank.labels.organization}
              value={DATA.organizationAm}
            />
            <Field
              locale={locale}
              label={c.bank.labels.tin}
              value={DATA.tin}
              mono
              copy
            />
            <Field
              locale={locale}
              label={c.bank.labels.bank}
              value={DATA.bankAm}
            />
            <Field
              locale={locale}
              label={c.bank.labels.account}
              value={DATA.account}
              mono
              copy
            />
            <Field
              locale={locale}
              label={c.bank.labels.purpose}
              value={PURPOSE[locale]}
            />
          </dl>
        </Card>

        <Card accent="navy">
          <h2 className="flex flex-wrap items-center gap-2 font-display text-xl font-bold text-navy-900">
            {c.swift.heading}
            <span className="rounded-full bg-navy-900/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-navy-700">
              {COMING_SOON[locale]}
            </span>
          </h2>
          <p className="mt-2 text-navy-700">{c.swift.intro}</p>
          <dl className="mt-4">
            <Field
              locale={locale}
              label={c.swift.labels.beneficiary}
              value={DATA.organizationLatin}
            />
            <Field
              locale={locale}
              label={c.swift.labels.beneficiaryAddress}
              value={DATA.addressLatin}
            />
            <Field
              locale={locale}
              label={c.swift.labels.account}
              value={DATA.account}
              mono
              copy
            />
            <Field
              locale={locale}
              label={c.swift.labels.tin}
              value={DATA.tin}
              mono
              copy
            />
            <Field
              locale={locale}
              label={c.swift.labels.bank}
              value={DATA.bankLatin}
            />
            <Field
              locale={locale}
              label={c.swift.labels.bankAddress}
              value={DATA.bankAddress}
            />
            <Field
              locale={locale}
              label={c.swift.labels.swift}
              value={DATA.swift}
              mono
              copy
            />
            <Field
              locale={locale}
              label={c.swift.labels.purpose}
              value="Donation — election observation mission"
            />
          </dl>
        </Card>

        <Card accent="navy">
          <h2 className="flex flex-wrap items-center gap-2 font-display text-xl font-bold text-navy-900">
            {c.wallets.heading}
            <span className="rounded-full bg-navy-900/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-navy-700">
              {COMING_SOON[locale]}
            </span>
          </h2>
          <p className="mt-2 text-navy-700">{c.wallets.intro}</p>
          <dl className="mt-4">
            <Field
              locale={locale}
              label={c.wallets.labels.idram}
              value={DATA.idram}
              mono
              copy
            />
            <Field
              locale={locale}
              label={c.wallets.labels.easypay}
              value={DATA.easypay}
              mono
              copy
            />
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
