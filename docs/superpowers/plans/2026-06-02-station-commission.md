# Per-station Commission (ԸԸՀ) Members — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show each polling station's 8 precinct-commission (ԸԸՀ) members on its detail page, and a compact chair summary in each map pin's popup.

**Architecture:** A public CEC XLSX (`/File/PecMembersToExcel?electionId=28826`) is mirrored by a script to a committed, bundled `data/pec-members.json` (keyed by precinct). A new `lib/commission.ts` reads it and exposes per-station lookups; a `CommissionSection` server component renders the list on the detail page, and the map page passes a lightweight chair summary into the existing Leaflet popup.

**Tech Stack:** Next.js 15 App Router (RSC), next-intl (am/en/ru), `xlsx` (already a dep), Tailwind, react-leaflet (existing).

**Notes for the implementer:**
- **No test runner** in this project (intentional). Verify with `npx tsc --noEmit`, targeted `npx tsx -e` checks, and `pnpm dev`. Do NOT add a test framework.
- Package manager is **pnpm**. Commits are **local only** — the maintainer pushes. Scope each `git add` to the listed files (the tree has unrelated untracked files; never `git add -A`).
- Party abbreviations (`ՔՊԿ`, `ՀԱՅԱՍՏԱՆ`, `ՊԱՏԻՎ ՈՒՆԵՄ`, `ԸԸՀ`) stay Armenian in all locales. Member **names** are transliterated for en/ru.
- Client components (`MapView`, `StationsMap`) must import `CommissionChair` as a **type-only** import (`import type …`) so the 2 MB data JSON is never pulled into the client bundle.

---

## Task 1: Fetch script + committed data file

**Files:**
- Create: `scripts/fetch-pec-members.mjs`
- Create (generated): `data/pec-members.json`

- [ ] **Step 1: Create `scripts/fetch-pec-members.mjs`**

```js
#!/usr/bin/env node
/**
 * Fetch precinct electoral commission (ԸԸՀ/PEC) members from the public CEC
 * export and write data/pec-members.json (keyed by precinct "1/1").
 *
 *   Source: https://www.elections.am/File/PecMembersToExcel?electionId=<id>
 *   node scripts/fetch-pec-members.mjs            # electionId 28826 (2026 NA)
 */
import xlsx from "xlsx";
import { writeFileSync } from "node:fs";

const electionId = process.argv[2] ?? "28826";
const URL = `https://www.elections.am/File/PecMembersToExcel?electionId=${electionId}`;
const norm = (c) => {
  const [a, b] = String(c).split(/[/-]/);
  return a && b ? `${Number(a)}/${Number(b)}` : String(c);
};
const ROLE = { "նախագահ": "chair", "քարտուղար": "secretary" };
const ORDER = { chair: 0, secretary: 1, member: 2 };

const res = await fetch(URL, {
  headers: { "User-Agent": "ditaket-observer/1.0 (grisha.khachatrian@gmail.com)" },
});
if (!res.ok) {
  console.error(`[pec] HTTP ${res.status} from ${URL}`);
  process.exit(1);
}
const buf = Buffer.from(await res.arrayBuffer());
const wb = xlsx.read(buf, { type: "buffer" });
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "", raw: false });
console.log(`[pec] ${rows.length} member rows from electionId ${electionId}`);

const store = {};
for (const r of rows) {
  const precinct = norm(r["Տեղամաս"]);
  const name = String(r["ՏԸՀ Անդամ"] ?? "").trim();
  if (!precinct || !name) continue;
  const role = ROLE[String(r["Պաշտոնը"] ?? "").trim()] ?? "member";
  const party = String(r["Նշանակվել է"] ?? "").replace(/\s+/g, " ").trim();
  const certificate = String(r["Վկայական"] ?? "").trim();
  (store[precinct] ??= []).push({ name, role, party, certificate });
}
for (const p of Object.keys(store)) store[p].sort((a, b) => ORDER[a.role] - ORDER[b.role]);

writeFileSync("data/pec-members.json", JSON.stringify(store, null, 2) + "\n");
const precincts = Object.keys(store).length;
const members = Object.values(store).reduce((n, m) => n + m.length, 0);
console.log(`[pec] wrote ${precincts} precincts, ${members} members → data/pec-members.json`);
```

- [ ] **Step 2: Run it to generate the data file**

Run: `node scripts/fetch-pec-members.mjs 28826`
Expected: prints `~16040 member rows` then `wrote 2005 precincts, 16040 members → data/pec-members.json`.

- [ ] **Step 3: Sanity-check the file**

Run:
```bash
node -e "const d=require('./data/pec-members.json'); const k=Object.keys(d); console.log('precincts:',k.length); console.log('1/1 members:',d['1/1'].length); console.log('1/1 chair:',d['1/1'].find(m=>m.role==='chair'));"
```
Expected: `precincts: 2005`, `1/1 members: 8`, and a chair object with `name/role/party/certificate`.

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-pec-members.mjs data/pec-members.json
git commit -m "feat(commission): fetch PEC members + commit data/pec-members.json"
```

---

## Task 2: Data layer — export `normCec`, add `lib/commission.ts`

**Files:**
- Modify: `lib/stations.ts` (export `normCec`)
- Create: `lib/commission.ts`

- [ ] **Step 1: Export `normCec` from `lib/stations.ts`**

Find this function (near the top of the file):
```ts
function normCec(c: string): string {
  const [a, b] = c.split('/');
  return a && b ? `${Number(a)}/${Number(b)}` : c;
}
```
Change the first line to export it:
```ts
export function normCec(c: string): string {
  const [a, b] = c.split('/');
  return a && b ? `${Number(a)}/${Number(b)}` : c;
}
```

- [ ] **Step 2: Create `lib/commission.ts`**

```ts
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
```

- [ ] **Step 3: Verify (typecheck + runtime)**

Run:
```bash
npx tsc --noEmit
npx tsx -e "import {getStationCommission, getCommissionChair} from './lib/commission'; const c=getStationCommission('1/1','am'); console.log('members:',c?.members.length,'chair:',c?.chair?.name,c?.chair?.party); console.log('en chair:', getCommissionChair('1/1','en'));"
```
Expected: tsc clean (0 errors); prints `members: 8 chair: <Armenian name> ՔՊԿ` and an en chair with a transliterated name. (If tsc is unusually slow on the JSON import, that is the known cost of the bundled 2 MB literal — the `as unknown as` cast keeps it correct; do not switch to fs reads, which break serverless bundling.)

- [ ] **Step 4: Commit**

```bash
git add lib/stations.ts lib/commission.ts
git commit -m "feat(commission): lib/commission.ts (getStationCommission, getCommissionChair)"
```

---

## Task 3: i18n — `Commission` block

**Files:**
- Modify: `messages/am.json`, `messages/en.json`, `messages/ru.json`

- [ ] **Step 1: Add a top-level `Commission` block to each file**

Place it as a sibling of the existing `Station` block (keep valid JSON — add a comma after the preceding block's closing brace).

`messages/am.json`:
```json
  "Commission": {
    "title": "ԸԸՀ կազմ",
    "composition": "8 անդամ — 2-ական ՔՊԿ, ՀԱՅԱՍՏԱՆ, ՊԱՏԻՎ ՈՒՆԵՄ և ԸԸՀ-ի կողմից",
    "roleChair": "նախագահ",
    "roleSecretary": "քարտուղար",
    "roleMember": "անդամ",
    "certificate": "Վկայական",
    "chairLabel": "Նախագահ"
  },
```

`messages/en.json`:
```json
  "Commission": {
    "title": "Commission",
    "composition": "8 members — 2 each nominated by ՔՊԿ, ՀԱՅԱՍՏԱՆ, ՊԱՏԻՎ ՈՒՆԵՄ and the TEC",
    "roleChair": "Chair",
    "roleSecretary": "Secretary",
    "roleMember": "Member",
    "certificate": "Certificate №",
    "chairLabel": "Chair"
  },
```

`messages/ru.json`:
```json
  "Commission": {
    "title": "Состав комиссии",
    "composition": "8 членов — по 2 от ՔՊԿ, ՀԱՅԱՍՏԱՆ, ՊԱՏԻՎ ՈՒՆԵՄ и ТИК",
    "roleChair": "председатель",
    "roleSecretary": "секретарь",
    "roleMember": "член",
    "certificate": "Свидетельство №",
    "chairLabel": "Председатель"
  },
```

- [ ] **Step 2: Verify JSON validity**

Run:
```bash
node -e "for(const f of ['am','en','ru']){const j=require('./messages/'+f+'.json'); if(!j.Commission?.title||!j.Commission?.chairLabel){console.error('missing in '+f);process.exit(1)} console.log(f,'ok')}"
```
Expected: `am ok`, `en ok`, `ru ok`.

- [ ] **Step 3: Commit**

```bash
git add messages/am.json messages/en.json messages/ru.json
git commit -m "i18n: add Commission block"
```

---

## Task 4: `CommissionSection` on the station detail page

**Files:**
- Create: `components/CommissionSection.tsx`
- Modify: `app/[locale]/s/[stationId]/page.tsx`

- [ ] **Step 1: Create `components/CommissionSection.tsx`**

```tsx
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
    r === 'chair' ? t('roleChair') : r === 'secretary' ? t('roleSecretary') : t('roleMember');

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
              <div className="mt-1 font-display text-lg font-bold text-navy-900">{m.name}</div>
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
```
(Note: `Card` already supports `accent="navy" | "orange"` — see its use in `app/[locale]/marz/[marz]/[community]/page.tsx`.)

- [ ] **Step 2: Render it on the detail page**

In `app/[locale]/s/[stationId]/page.tsx`, add the import after the `MapLink` import (line 13):
```tsx
import { CommissionSection } from '@/components/CommissionSection';
```
Then add the section immediately before the closing `</main>` (after the existing events `</section>` at line 103):
```tsx
      </section>

      <CommissionSection cecCode={station.cecCode} locale={locale} />
    </main>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` (expect clean), then `pnpm dev` and open `http://localhost:3000/am/s/01-001`.
Expected: a "ԸԸՀ կազմ" section with 8 cards (chair + secretary in orange, 6 members in navy), each showing role, party badge, name, and `Վկայական <№>`; caption line present. Check `/en/s/01-001` (transliterated names, English labels) and `/ru/s/01-001`.

- [ ] **Step 4: Commit**

```bash
git add components/CommissionSection.tsx "app/[locale]/s/[stationId]/page.tsx"
git commit -m "feat(commission): show commission members on station detail page"
```

---

## Task 5: Chair summary in the map popup

**Files:**
- Modify: `components/StationsMap.tsx`
- Modify: `components/MapView.tsx`
- Modify: `app/[locale]/map/page.tsx`

- [ ] **Step 1: `components/StationsMap.tsx` — accept chair + render it**

Add a type-only import for `CommissionChair` after the existing `GeoStation` import:
```tsx
import type { CommissionChair } from '@/lib/commission';
```
Replace the component signature (currently `export default function StationsMap({ stations, locale, directionsLabel }: { stations: GeoStation[]; locale: Locale; directionsLabel: string; })`) with:
```tsx
type MapStation = GeoStation & { chair: CommissionChair | null };

export default function StationsMap({
  stations,
  locale,
  directionsLabel,
  chairLabel,
}: {
  stations: MapStation[];
  locale: Locale;
  directionsLabel: string;
  chairLabel: string;
}) {
```
In the `<Popup>`, add the chair line between the `cecCode` div and the maps-link `<a>`:
```tsx
              <div className="text-xs opacity-70">{s.cecCode}</div>
              {s.chair ? (
                <div className="mt-1 text-xs">
                  {chairLabel}: {s.chair.name} ({s.chair.party})
                </div>
              ) : null}
              <a
                href={mapsUrl(s.lat, s.lng)}
```

- [ ] **Step 2: `components/MapView.tsx` — thread chair + chairLabel**

Add a type-only import after the `GeoStation` import:
```tsx
import type { CommissionChair } from '@/lib/commission';
```
Replace the `MapView` export with:
```tsx
type MapStation = GeoStation & { chair: CommissionChair | null };

export function MapView(props: {
  stations: MapStation[];
  locale: Locale;
  directionsLabel: string;
  chairLabel: string;
}) {
  return <StationsMap {...props} />;
}
```

- [ ] **Step 3: `app/[locale]/map/page.tsx` — attach chair + pass label**

Add the import (after the `MapView` import):
```tsx
import { getCommissionChair } from '@/lib/commission';
```
Add the Commission translations alongside the existing ones (after line 19, `const tStation = …`):
```tsx
  const tCommission = await getTranslations('Commission');
```
Replace the data-loading + render block:
```tsx
  const stations = await listGeolocatedStations(locale);
  const mapStations = stations.map((s) => ({
    ...s,
    chair: getCommissionChair(s.cecCode, locale),
  }));
  const total = await countStations();

  return (
    <main className="container-main py-12">
      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {t('title')}
      </h1>
      <p className="mt-2 text-navy-700">
        {t('coverage', { mapped: stations.length, total })}
      </p>

      <div className="mt-8">
        {mapStations.length > 0 ? (
          <MapView
            stations={mapStations}
            locale={locale}
            directionsLabel={tStation('openInMaps')}
            chairLabel={tCommission('chairLabel')}
          />
        ) : (
          <p className="text-navy-700">{t('empty')}</p>
        )}
      </div>
    </main>
  );
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` (expect clean), then `pnpm dev` and open `http://localhost:3000/am/map`.
Expected: clicking a pin shows the popup with a `Նախագահ: <name> (<party>)` line above the directions link; the station-detail link still works; `/en/map` shows `Chair: <transliterated name> (<party>)`.
Also confirm the chair data did not leak into the client lib bundle: `grep -rl "pec-members" .next/static 2>/dev/null` returns nothing (the JSON stays server-side).

- [ ] **Step 5: Commit**

```bash
git add components/StationsMap.tsx components/MapView.tsx "app/[locale]/map/page.tsx"
git commit -m "feat(commission): show chair summary in map pin popups"
```

---

## Final verification

- [ ] `npx tsc --noEmit` clean.
- [ ] `pnpm dev` sweep: `/am/s/01-001` (8-member commission section), `/am/map` pin popup (chair line + link), `/en/…` and `/ru/…` (transliterated names, localized labels).
- [ ] Spot-check one non-ՔՊԿ-chaired precinct against the XLSX (e.g. find a `ՀԱՅԱՍՏԱՆ`-chaired one via `node -e "const d=require('./data/pec-members.json'); console.log(Object.entries(d).find(([k,v])=>v.find(m=>m.role==='chair'&&m.party==='ՀԱՅԱՍՏԱՆ'))[0])"`).
- [ ] `data/pec-members.json` committed (needed for the bundled import in prod).
