# Coordinate Accuracy (verified vs approximate) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tag each station coordinate as `verified` (our 80 Register extractions) or `approximate` (AccessibilityMap bulk), and show it via green/amber map pins + legend and a station-detail note.

**Architecture:** A new committed `data/station-coords.verified.json` (the 80) overrides the approximate bulk `data/station-coords.json` in the data layer, which now resolves a `coordAccuracy` per station. The map colors pins via Leaflet `divIcon`; the detail page shows a small note.

**Tech Stack:** Next.js 15 App Router (RSC), next-intl (am/en/ru), react-leaflet, Tailwind.

**Notes:** No test runner — verify with `npx tsc --noEmit` + `pnpm dev`. pnpm. Commits local only (maintainer pushes); scope each `git add`. Use inline hex colors for pins/legend/note (the Tailwind palette is navy/orange/cream — don't rely on `green-*`).

---

## Task 1: Verified-coords data file

**Files:** Create `data/station-coords.verified.json`

- [ ] **Step 1: Recover the 80 verified coords from git**

```bash
git show 6850d91:data/station-coords.json > data/station-coords.verified.json
```

- [ ] **Step 2: Verify**

```bash
node -e "const v=require('./data/station-coords.verified.json'); const k=Object.keys(v); console.log('verified precincts:',k.length); console.log('sources:',[...new Set(Object.values(v).map(x=>x.source))].join(', '));"
```
Expected: `verified precincts: 80`, sources include `cec-register` / `shared-building(...)`.

- [ ] **Step 3: Commit**

```bash
git add data/station-coords.verified.json
git commit -m "data(coords): add verified coordinate set (80 Register extractions)"
```

---

## Task 2: Data layer — `coordAccuracy`

**Files:** Modify `lib/stations.ts`

- [ ] **Step 1: Import the verified file** — after line 15 (`import stationCoords from '@/data/station-coords.json';`) add:

```ts
import stationCoordsVerified from '@/data/station-coords.verified.json';
```

- [ ] **Step 2: Add `coordAccuracy` to `StationView`** — in the `StationView` type, after `lng: number | null;` add:

```ts
  coordAccuracy: 'verified' | 'approximate' | null;
```

- [ ] **Step 3: Replace the `COORD_BY_CEC` block** (the comment + IIFE at lines ~51–65) with two maps + a resolver:

```ts
export type CoordAccuracy = 'verified' | 'approximate';

// Coordinates come from two committed, bundled files: the verified set (our CEC
// Register extractions) takes precedence over the approximate AccessibilityMap
// bulk. Each station thus resolves coords + an accuracy tag, overlaid onto rows
// from the DB or the dev fixture.
function buildCoordMap(store: unknown): Map<string, { lat: number; lng: number }> {
  const m = new Map<string, { lat: number; lng: number }>();
  for (const [key, v] of Object.entries(
    store as Record<string, { lat: number; lng: number }>,
  )) {
    if (typeof v?.lat === 'number' && typeof v?.lng === 'number') {
      m.set(normCec(key), { lat: v.lat, lng: v.lng });
    }
  }
  return m;
}
const VERIFIED_BY_CEC = buildCoordMap(stationCoordsVerified);
const APPROX_BY_CEC = buildCoordMap(stationCoords);

function resolveCoord(
  cecCode: string,
): { lat: number; lng: number; accuracy: CoordAccuracy } | null {
  const k = normCec(cecCode);
  const v = VERIFIED_BY_CEC.get(k);
  if (v) return { ...v, accuracy: 'verified' };
  const a = APPROX_BY_CEC.get(k);
  if (a) return { ...a, accuracy: 'approximate' };
  return null;
}
```

- [ ] **Step 4: Use the resolver in `loadDevFixture`** — replace:

```ts
    const coord = COORD_BY_CEC.get(normCec(s.cecCode)) ?? null;
```
with:
```ts
    const coord = resolveCoord(s.cecCode);
```
and in that same returned object replace the `lat`/`lng` lines with:
```ts
      lat: coord?.lat ?? null,
      lng: coord?.lng ?? null,
      coordAccuracy: coord?.accuracy ?? null,
```

- [ ] **Step 5: Add `coordAccuracy` to `GeoStation`** — in the `GeoStation` type, after `lng: number;` add:

```ts
  coordAccuracy: CoordAccuracy;
```

- [ ] **Step 6: Carry it through `toGeo`** — in `listGeolocatedStations`, in the object returned by `toGeo`, after `stationNumber: s.stationNumber,` add:

```ts
      coordAccuracy: s.coordAccuracy ?? 'approximate',
```

- [ ] **Step 7: Use the resolver in `rowToView`** — replace:

```ts
  const coord = COORD_BY_CEC.get(normCec(row.cecCode)) ?? null;
```
with:
```ts
  const coord = resolveCoord(row.cecCode);
```
and replace its `lat`/`lng` lines with:
```ts
    lat: coord?.lat ?? row.lat,
    lng: coord?.lng ?? row.lng,
    coordAccuracy:
      coord?.accuracy ?? (row.lat != null && row.lng != null ? 'approximate' : null),
```

- [ ] **Step 8: Verify**

```bash
npx tsc --noEmit
npx tsx -e "import {getStationById, listGeolocatedStations} from './lib/stations'; (async()=>{const a=await getStationById('01-001'); const b=await getStationById('02-001'); console.log('1/1:',a?.coordAccuracy,'| 2/1:',b?.coordAccuracy); const g=await listGeolocatedStations('am'); const v=g.filter(s=>s.coordAccuracy==='verified').length; console.log('geolocated:',g.length,'verified:',v,'approx:',g.length-v);})()" 2>&1 | grep -vE "npm warn|DATABASE_URL|fall back"
```
Expected: `1/1: verified` (it's in our 80), `2/1: approximate`; `geolocated: 2005 verified: 80 approx: 1925`.

- [ ] **Step 9: Commit**

```bash
git add lib/stations.ts
git commit -m "feat(coords): resolve verified vs approximate coordAccuracy per station"
```

---

## Task 3: i18n

**Files:** Modify `messages/am.json`, `messages/en.json`, `messages/ru.json`

- [ ] **Step 1: Add accuracy keys to the `Map` block** (after `empty`) and to the `Station` block (after `openInMaps`). Keep valid JSON (add commas).

`am.json` — `Map`: add `"accVerified": "ճշգրտված", "accApprox": "մոտավոր"`; `Station`: add `"coordVerified": "Ճշգրտված տեղադիրք", "coordApprox": "Մոտավոր տեղադիրք"`.

`en.json` — `Map`: `"accVerified": "Verified", "accApprox": "Approximate"`; `Station`: `"coordVerified": "Verified location", "coordApprox": "Approximate location"`.

`ru.json` — `Map`: `"accVerified": "Точные", "accApprox": "Приблизит."`; `Station`: `"coordVerified": "Точное местоположение", "coordApprox": "Приблизительное местоположение"`.

- [ ] **Step 2: Verify**

```bash
node -e "for(const f of ['am','en','ru']){const j=require('./messages/'+f+'.json'); if(!j.Map.accVerified||!j.Map.accApprox||!j.Station.coordVerified||!j.Station.coordApprox){console.error('missing in '+f);process.exit(1)} console.log(f,'ok')}"
```
Expected: `am ok`, `en ok`, `ru ok`.

- [ ] **Step 3: Commit**

```bash
git add messages/am.json messages/en.json messages/ru.json
git commit -m "i18n: add coordinate-accuracy labels"
```

---

## Task 4: Map — colored pins + legend

**Files:** Modify `components/StationsMap.tsx`, `app/[locale]/map/page.tsx`

- [ ] **Step 1: Replace the single icon in `StationsMap.tsx`** — replace the `const icon = L.icon({...});` block with two `divIcon`s:

```tsx
function makeDot(color: string) {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  });
}
const ICONS: Record<'verified' | 'approximate', L.DivIcon> = {
  verified: makeDot('#2e7d32'),
  approximate: makeDot('#e0a800'),
};
```

- [ ] **Step 2: Use the per-accuracy icon** — in the `<Marker>` change `icon={icon}` to:

```tsx
          icon={ICONS[s.coordAccuracy]}
```
(`s` is a `MapStation` which extends `GeoStation`, so `s.coordAccuracy` is present.)

- [ ] **Step 3: Add a legend in `app/[locale]/map/page.tsx`** — after the coverage `<p>` (the `{t('coverage', …)}` paragraph), add:

```tsx
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-navy-700">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            style={{ background: '#2e7d32' }}
            className="inline-block h-3 w-3 rounded-full ring-2 ring-white"
          />
          {t('accVerified')} ·{' '}
          {mapStations.filter((s) => s.coordAccuracy === 'verified').length}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            style={{ background: '#e0a800' }}
            className="inline-block h-3 w-3 rounded-full ring-2 ring-white"
          />
          {t('accApprox')} ·{' '}
          {mapStations.filter((s) => s.coordAccuracy === 'approximate').length}
        </span>
      </div>
```
(`mapStations` already exists in this file from the commission feature; it spreads `GeoStation`, so `coordAccuracy` is present. No new import.)

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```
Expected: clean. Then `pnpm dev` → `http://localhost:3000/am/map`: legend shows `ճշգրտված · 80` and `մոտավոր · 1925`; pins are green (the 80) and amber (rest); popups still work.

- [ ] **Step 5: Commit**

```bash
git add components/StationsMap.tsx "app/[locale]/map/page.tsx"
git commit -m "feat(map): color pins by coordinate accuracy + legend"
```

---

## Task 5: Detail-page accuracy note

**Files:** Modify `app/[locale]/s/[stationId]/page.tsx`

- [ ] **Step 1: Add the note under the Maps button** — the page has a block:

```tsx
          {station.lat != null && station.lng != null ? (
            <div className="mt-4">
              <MapLink
                lat={station.lat}
                lng={station.lng}
                label={t('openInMaps')}
                variant="button"
              />
            </div>
          ) : null}
```
Immediately after that block, add:

```tsx
          {station.coordAccuracy ? (
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-navy-700/70">
              <span
                aria-hidden="true"
                style={{
                  background:
                    station.coordAccuracy === 'verified' ? '#2e7d32' : '#e0a800',
                }}
                className="inline-block h-2 w-2 rounded-full"
              />
              {station.coordAccuracy === 'verified'
                ? t('coordVerified')
                : t('coordApprox')}
            </p>
          ) : null}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Then `pnpm dev`: `/am/s/01-001` (verified) shows a green-dot "Ճշգրտված տեղադիրք"; `/am/s/02-001` (approximate) shows an amber-dot "Մոտավոր տեղադիրք".

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/s/[stationId]/page.tsx"
git commit -m "feat(station): show coordinate-accuracy note on detail page"
```

---

## Final verification

- [ ] `npx tsc --noEmit` clean.
- [ ] `pnpm dev`: `/am/map` legend (80 verified / 1925 approx) + green/amber pins; `/am/s/01-001` verified note, an approximate station's note; `/en` + `/ru` labels localized.
