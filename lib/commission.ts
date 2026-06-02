/**
 * Precinct electoral commission (ԸԸՀ) members per station. Backed by the
 * committed data/pec-members.json (from scripts/fetch-pec-members.mjs), bundled
 * at build. Server-side only — never import the value into a client component.
 */
import pecMembersJson from '@/data/pec-members.json';
import { armToLatin, armToCyrillic } from '../scripts/transliterate';
import { normCec } from './stations';
import type { Locale } from './i18n/routing';

export type CommissionRole = 'chair' | 'secretary' | 'member';
export type CommissionMember = {
  name: string;
  role: CommissionRole;
  party: string;
  certificate: string;
};
export type Commission = {
  members: CommissionMember[];
  chair: CommissionMember | null;
  secretary: CommissionMember | null;
};
export type CommissionChair = { name: string; party: string };

// Cast away the giant inferred JSON literal type.
const STORE = pecMembersJson as unknown as Record<string, CommissionMember[]>;
const ORDER: Record<CommissionRole, number> = { chair: 0, secretary: 1, member: 2 };

function localizeName(name: string, locale: Locale): string {
  if (locale === 'en') return armToLatin(name);
  if (locale === 'ru') return armToCyrillic(name);
  return name;
}

export function getStationCommission(
  cecCode: string,
  locale: Locale,
): Commission | null {
  const raw = STORE[normCec(cecCode)];
  if (!raw || raw.length === 0) return null;
  const members = raw
    .map((m) => ({ ...m, name: localizeName(m.name, locale) }))
    .sort((a, b) => ORDER[a.role] - ORDER[b.role]);
  return {
    members,
    chair: members.find((m) => m.role === 'chair') ?? null,
    secretary: members.find((m) => m.role === 'secretary') ?? null,
  };
}

/** Lightweight chair summary for the map popup (name + party only). */
export function getCommissionChair(
  cecCode: string,
  locale: Locale,
): CommissionChair | null {
  const chair = STORE[normCec(cecCode)]?.find((m) => m.role === 'chair');
  return chair ? { name: localizeName(chair.name, locale), party: chair.party } : null;
}
