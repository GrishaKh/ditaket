# Per-station electoral commission (ԸԸՀ) members — design

**Date:** 2026-06-02
**Status:** approved (design); pending spec review
**Author:** Ditaket mission (with Claude)

## Summary

Show the precinct electoral commission (ԸԸՀ / PEC) members on each polling-station
page, and a compact chair summary in each map pin's popup. The data is a public CEC
bulk export — `/File/PecMembersToExcel?electionId=28826` (16,040 rows, exactly 8
members per precinct, 1:1 with our 2,005 stations). We mirror it to a committed JSON
(bundled, no DB).

## Key data facts (verified)

- 2,005 precincts × **8 members** each; roles per precinct: **1 chair (նախագահ) + 1
  secretary (քարտուղար) + 6 members (անդամ)**.
- Nominating bodies per precinct are **uniformly 2·2·2·2** (`ՔՊԿ`, `ՀԱՅԱՍՏԱՆ`,
  `ՊԱՏԻՎ ՈՒՆԵՄ`, and `ԸԸՀ`/TEC) at **every** precinct → a per-station "balance" line
  is redundant and is NOT shown.
- The **varying, meaningful** datum is **which party holds the chair** (and
  secretary): chairs split ՔՊԿ 1,331 / ՀԱՅԱՍՏԱՆ 543 / ՊԱՏԻՎ ՈՒՆԵՄ 131; the TEC-
  appointed members never chair. The UI features the chair/secretary party.

## Goals

- On `/[locale]/s/[stationId]`: list all 8 members (chair & secretary emphasized),
  each with **name, role, nominating party, certificate №**.
- On `/[locale]/map`: each pin's popup shows a compact summary — **chair name +
  party** — plus the existing link to the station detail page (full list).
- Works on deploy, no manual import step (same pattern as `station-coords.json`).

## Non-goals

- No member search across precincts; no aggregate/stats page (deferred).
- No pin **color-coding / filtering** by chair party (deferred; the chair-party
  field this adds would make it easy later).
- No DB table; no new test framework.
- List/community-card pages unchanged.

## Decisions (locked via Q&A)

| Question | Decision |
|---|---|
| Fields per member (detail page) | name + role + nominating party + certificate № |
| Map popup | compact: chair name + party + "full list →" link (no balance line) |
| Sourcing/storage | **A** — committed JSON, bundled, no DB |
| en/ru member names | transliterate via `armToLatin`/`armToCyrillic` (site-consistent) — *flagged; flip to Armenian-only if preferred* |

## Data source

`https://www.elections.am/File/PecMembersToExcel?electionId=28826` — XLSX, sheet
`Հանձնաժողովների կազմեր`:

| Column | Meaning | Use |
|---|---|---|
| `Տեղամաս` | precinct, e.g. `1/1` | **join key → station `cecCode`** |
| `ՏԸՀ Անդամ` | member full name | `name` |
| `Վկայական` | certificate № | `certificate` |
| `Նշանակվել է` | nominating body (trim trailing whitespace) | `party` |
| `Պաշտոնը` | `նախագահ`/`քարտուղար`/`անդամ` | `role` → `chair`/`secretary`/`member` |
| `Մարզ`/`Համայնք`/`Ընտրատարածք` | context | unused |

## Data layer

**Script** `scripts/fetch-pec-members.mjs` (mirrors `scripts/fetch-station-coords.mjs`):
fetch the XLSX → parse with `xlsx` → group by `normCec(Տեղամաս)` → map role → write
`data/pec-members.json`:
```json
{
  "1/1": [
    { "name": "Քյուրքջյան Մարինե Տրդատի", "role": "chair", "party": "ՔՊԿ", "certificate": "2501197" },
    { "name": "Գասպարյան Անուշ Սաշայի", "role": "secretary", "party": "ՀԱՅԱՍՏԱՆ", "certificate": "2607724" }
  ]
}
```
(8 entries per precinct.) Log precinct count + member total. Bundled (~2 MB,
server-side only — not sent to the client).

**Module** `lib/commission.ts` (new; keeps `lib/stations.ts` focused):
```ts
export type CommissionRole = 'chair' | 'secretary' | 'member';
export type CommissionMember = { name: string; role: CommissionRole; party: string; certificate: string };
export type Commission = { members: CommissionMember[]; chair: CommissionMember | null; secretary: CommissionMember | null };
export type CommissionChair = { name: string; party: string };
```
- static-imports `data/pec-members.json`.
- `getStationCommission(cecCode, locale): Commission | null` — look up by
  `normCec`; sort chair → secretary → member; transliterate `name` for en/ru
  (party left as the Armenian abbreviation); expose `chair`/`secretary` for
  convenience. Returns `null` if absent.
- `getCommissionChair(cecCode, locale): CommissionChair | null` — lightweight
  helper for the map ( chair `name` + `party` only).
- export `normCec` from `lib/stations.ts` and reuse it here (avoid divergence).

## UI

### Detail page — `components/CommissionSection.tsx` (server component)
Props `{ cecCode, locale }`; calls `getStationCommission`; returns `null` if none.
- heading `Commission.title` (ԸԸՀ կազմ / Commission / Состав комиссии);
- a one-line static caption `Commission.composition` ("8 members — 2 each nominated
  by ՔՊԿ, ՀԱՅԱՍՏԱՆ, ՊԱՏԻՎ ՈՒՆԵՄ and the TEC");
- **chair** and **secretary** rows emphasized first (name · localized role label ·
  party badge · cert №), then the 6 members (name · party badge · cert №);
- uses existing `Card`/`Badge`/`Pill` and navy/orange styling.
Rendered on `app/[locale]/s/[stationId]/page.tsx`, below the existing content.

### Map — popup summary
- `app/[locale]/map/page.tsx` (already `force-dynamic`): for each geolocated
  station it passes to the map, attach `chair: getCommissionChair(cecCode, locale)`
  (≈ chair name + party; adds ~90 KB across 2,005 stations — acceptable).
- `components/StationsMap.tsx` popup: add a line — localized "chair" label + chair
  name + party — above the existing detail/"open in maps" links. (Pin type extended
  with an optional `chair { name, party }`.)

## i18n

`messages/{am,en,ru}.json` — new `Commission` block: `title`, `composition`
(caption), `roleChair`, `roleSecretary`, `roleMember`, `certificate`, `chairLabel`
(for the map popup, e.g. "Chair").

## Privacy

PEC member names + certificate numbers are **published publicly by the CEC**
(officials in their electoral role). Displaying them on an accredited observer
mission's transparency portal is appropriate. No private data is introduced.

## Verification

No test runner (not adding one).
- `npx tsc --noEmit` clean.
- `pnpm dev`: `/am/s/01-001` shows 8 members (chair/secretary emphasized, parties,
  certs, caption); `/am/map` pin popup shows chair name + party + working link;
  `/en/…` and `/ru/…` render transliterated names + localized labels.
- Spot-check 2–3 precincts against the XLSX (incl. a non-ՔՊԿ-chaired one, e.g. find
  one chaired by ՀԱՅԱՍՏԱՆ).

## Refresh workflow

`node scripts/fetch-pec-members.mjs` → commit `data/pec-members.json` → deploy.
Same cadence as coordinates; no DB import.

## Open questions

None blocking. Future, easy given this data: color/filter map pins by chair party;
full party-name labels instead of abbreviations.
