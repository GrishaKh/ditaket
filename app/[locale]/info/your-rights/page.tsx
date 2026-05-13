import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { VOTER_RIGHTS } from '@/lib/content/your-rights';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const TITLE: Record<Locale, string> = {
  am: 'Քո իրավունքները',
  en: 'Your rights',
  ru: 'Ваши права',
};

export default async function YourRightsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('Nav');
  const content = VOTER_RIGHTS[locale];

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
        {content.lead}
      </p>

      <ul className="mt-10 space-y-4">
        {content.rights.map((r) => (
          <li key={r.title}>
            <Card accent="navy">
              <Badge tone="orange">{r.ecArticle}</Badge>
              <h2 className="mt-3 font-display text-xl font-bold text-navy-900">
                {r.title}
              </h2>
              <p className="mt-2 max-w-prose text-navy-700">{r.body}</p>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
