import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { Card } from '@/components/ui/Card';

const SECTIONS = [
  { id: 'how-to-vote', tone: 'navy' as const },
  { id: 'your-rights', tone: 'orange' as const },
  { id: 'violations', tone: 'navy' as const },
];

const LABELS: Record<
  string,
  { am: string; en: string; ru: string; desc: { am: string; en: string; ru: string } }
> = {
  'how-to-vote': {
    am: 'Ինչպես քվեարկել',
    en: 'How to vote',
    ru: 'Как голосовать',
    desc: {
      am: 'Քայլ առ քայլ՝ ինչ ակնկալել քվեարկության օրը։',
      en: 'Step by step — what to expect on voting day.',
      ru: 'Пошагово — чего ждать в день голосования.',
    },
  },
  'your-rights': {
    am: 'Քո իրավունքները',
    en: 'Your rights',
    ru: 'Ваши права',
    desc: {
      am: 'Ընտրողի օրինական իրավունքները՝ Ընտրական օրենսգրքի հղումներով։',
      en: "A voter's legal rights with Electoral Code references.",
      ru: 'Права избирателя со ссылками на Избирательный кодекс.',
    },
  },
  violations: {
    am: 'Ի՞նչ է խախտումը',
    en: 'What counts as a violation',
    ru: 'Что считается нарушением',
    desc: {
      am: 'Բոլոր կատեգորիաները, օրինակները և համապատասխան հոդվածները։',
      en: 'Every category, examples, and the matching Articles.',
      ru: 'Все категории, примеры и соответствующие статьи.',
    },
  },
};

export default async function InfoIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('Nav');

  return (
    <main className="container-main py-12">
      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {tNav('info')}
      </h1>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {SECTIONS.map((s) => {
          const l = LABELS[s.id]!;
          return (
            <a
              key={s.id}
              href={`/${locale}/info/${s.id}`}
              className="focus-ring block"
            >
              <Card accent={s.tone} className="h-full">
                <h2 className="font-display text-xl font-bold text-navy-900">
                  {l[locale]}
                </h2>
                <p className="mt-2 text-navy-700">{l.desc[locale]}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-orange">
                  →
                </span>
              </Card>
            </a>
          );
        })}
      </div>
    </main>
  );
}
