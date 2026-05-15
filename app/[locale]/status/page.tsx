import { sql } from 'drizzle-orm';
import type { Locale } from '@/lib/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { getDb, hasDatabase, schema } from '@/lib/db/client';
import { hasRateLimit } from '@/lib/rate-limit';
import { Card } from '@/components/ui/Card';

export const revalidate = 30;

const LABELS: Record<
  Locale,
  {
    title: string;
    lead: string;
    db: string;
    rateLimit: string;
    captcha: string;
    admin: string;
    reports: string;
    stations: string;
    ok: string;
    notConfigured: string;
    notReachable: string;
  }
> = {
  am: {
    title: 'Համակարգի վիճակ',
    lead: 'Ընթացիկ համակարգի կարգավիճակի ցուցիչներ։',
    db: 'Տվյալների բազա',
    rateLimit: 'Հարցումների սահմանափակում',
    captcha: 'Captcha (Turnstile)',
    admin: 'Մոդերացիա',
    reports: 'Հաստատված հաղորդումներ',
    stations: 'Գրանցված տեղամասեր',
    ok: 'Աշխատում է',
    notConfigured: 'Կարգավորված չէ',
    notReachable: 'Հասանելի չէ',
  },
  en: {
    title: 'System status',
    lead: 'Live indicators of system health.',
    db: 'Database',
    rateLimit: 'Rate limit',
    captcha: 'Captcha (Turnstile)',
    admin: 'Moderation',
    reports: 'Approved reports',
    stations: 'Registered stations',
    ok: 'Operational',
    notConfigured: 'Not configured',
    notReachable: 'Unreachable',
  },
  ru: {
    title: 'Статус системы',
    lead: 'Живые индикаторы состояния системы.',
    db: 'База данных',
    rateLimit: 'Лимит частоты',
    captcha: 'Captcha (Turnstile)',
    admin: 'Модерация',
    reports: 'Подтверждённые сообщения',
    stations: 'Зарегистрированные участки',
    ok: 'Работает',
    notConfigured: 'Не настроено',
    notReachable: 'Недоступно',
  },
};

export default async function StatusPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = LABELS[locale];

  let dbOk = false;
  let reportsCount = 0;
  let stationsCount = 0;
  if (hasDatabase) {
    try {
      const db = getDb();
      await db.execute(sql`select 1`);
      dbOk = true;
      const [r] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.events);
      reportsCount = r?.count ?? 0;
      const [s] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.stations);
      stationsCount = s?.count ?? 0;
    } catch {
      dbOk = false;
    }
  }

  type Row = { label: string; state: 'ok' | 'off' | 'fail'; note?: string };
  const rows: Row[] = [
    {
      label: t.db,
      state: !hasDatabase ? 'off' : dbOk ? 'ok' : 'fail',
      note: hasDatabase
        ? dbOk
          ? `${stationsCount} ${t.stations.toLowerCase()}, ${reportsCount} ${t.reports.toLowerCase()}`
          : t.notReachable
        : t.notConfigured,
    },
    {
      label: t.rateLimit,
      state: hasRateLimit ? 'ok' : 'off',
      note: hasRateLimit ? t.ok : t.notConfigured,
    },
    {
      label: t.captcha,
      state: process.env.TURNSTILE_SECRET_KEY ? 'ok' : 'off',
      note: process.env.TURNSTILE_SECRET_KEY ? t.ok : t.notConfigured,
    },
    {
      label: t.admin,
      state: process.env.ADMIN_PASSWORD ? 'ok' : 'off',
      note: process.env.ADMIN_PASSWORD ? t.ok : t.notConfigured,
    },
  ];

  return (
    <main className="container-main py-12">
      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {t.title}
      </h1>
      <p className="mt-3 text-navy-700">{t.lead}</p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.label}>
            <Card
              accent={r.state === 'ok' ? 'navy' : r.state === 'off' ? 'navy' : 'orange'}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    r.state === 'ok'
                      ? 'bg-green-500'
                      : r.state === 'off'
                        ? 'bg-navy-900/30'
                        : 'bg-red-500'
                  }`}
                />
                <span className="font-display text-lg font-bold text-navy-900">
                  {r.label}
                </span>
              </div>
              {r.note ? (
                <p className="mt-2 text-sm text-navy-700">{r.note}</p>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs text-navy-700/70">
        <code>/api/health</code> · JSON for uptime monitors
      </p>
    </main>
  );
}
