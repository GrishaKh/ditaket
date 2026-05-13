import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { HOW_TO_VOTE } from '@/lib/content/how-to-vote';
import { Card } from '@/components/ui/Card';

const TITLE: Record<Locale, string> = {
  am: 'Ինչպես քվեարկել',
  en: 'How to vote',
  ru: 'Как голосовать',
};

export default async function HowToVotePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('Nav');
  const c = HOW_TO_VOTE[locale];

  return (
    <main className="container-main py-12">
      <a
        href={`/${locale}/info`}
        className="text-sm text-navy-700 hover:text-navy-900"
      >
        ← {tNav('info')}
      </a>
      <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {TITLE[locale]}
      </h1>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-navy-700">
        {c.lead}
      </p>

      <ol className="mt-10 space-y-4">
        {c.steps.map((step, i) => (
          <li key={step.title}>
            <Card accent={i === c.steps.length - 1 ? 'orange' : 'navy'}>
              <div className="flex items-baseline gap-4">
                <span className="font-display text-3xl font-bold text-orange tabular-nums">
                  0{i + 1}
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold text-navy-900">
                    {step.title}
                  </h2>
                  <p className="mt-2 max-w-prose text-navy-700">{step.body}</p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <p className="mt-10 max-w-prose rounded-lg bg-navy-900 px-6 py-5 text-cream">
        {c.closing}
      </p>
    </main>
  );
}
