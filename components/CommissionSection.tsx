import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { getStationCommission, type CommissionMember } from '@/lib/commission';
import { Card } from '@/components/ui/Card';

export async function CommissionSection({
  cecCode,
  locale,
}: {
  cecCode: string;
  locale: Locale;
}) {
  const commission = getStationCommission(cecCode, locale);
  if (!commission) return null;
  const t = await getTranslations('Commission');
  const roleLabel = (r: CommissionMember['role']) =>
    r === 'chair'
      ? t('roleChair')
      : r === 'secretary'
        ? t('roleSecretary')
        : t('roleMember');

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold text-navy-900">{t('title')}</h2>
      <p className="mt-2 text-sm text-navy-700/80">{t('composition')}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {commission.members.map((m, i) => (
          <li key={`${m.certificate}-${i}`}>
            <Card accent={m.role === 'member' ? 'navy' : 'orange'}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-orange">
                  {roleLabel(m.role)}
                </span>
                <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cream">
                  {m.party}
                </span>
              </div>
              <div className="mt-1 font-display text-lg font-bold text-navy-900">
                {m.name}
              </div>
              <div className="mt-1 text-xs text-navy-700/70">
                {t('certificate')} {m.certificate}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
