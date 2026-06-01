# Polling-station Map Links + Overview Map — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface harvested polling-station coordinates as one-tap "Open in Maps" deep links (detail page + list cards) and add a national overview map of all geolocated stations.

**Architecture:** Coordinates live in `data/station-coords.json` (keyed by `cecCode`) and are merged into `StationView` at load time (dev) / imported into the `stations` table (prod). A pure `mapsUrl()` helper builds a universal Google Maps URL; a presentational `MapLink` component renders the link and returns `null` when coordinates are absent. The overview map is a client-only Leaflet + OpenStreetMap component.

**Tech Stack:** Next.js 15 (App Router, RSC), next-intl (hy/en/ru), Drizzle/Postgres with a dev JSON fallback, Tailwind, Leaflet + react-leaflet (Phase 2).

**Notes for the implementer:**
- The project has **no test runner** (intentional — see spec). Verification uses `pnpm lint`, `pnpm build`, and manual dev checks. Do not add a test framework.
- Package manager is **pnpm**.
- Commits are **local only**; the maintainer runs `git push` himself. Scope each `git add` to the files listed.
- `mapsUrl` provider is Google Maps (matches CEC's own `ShowOnMap`); changeable in one place later.

---

## Phase 1 — Deep-link button everywhere (no new dependencies)

### Task 1: Extend the data layer with coordinates

**Files:**
- Modify: `lib/stations.ts`

- [ ] **Step 1: Add `lat`/`lng` to the `StationView` type**

In `lib/stations.ts`, add two fields to the `StationView` type (after `accessibility: boolean;`):

```ts
  accessibility: boolean;
  lat: number | null;
  lng: number | null;
```

- [ ] **Step 2: Import `isNotNull` from drizzle-orm**

Change the drizzle import line at the top of the file:

```ts
import { and, eq, ilike, or, sql, asc, isNotNull } from 'drizzle-orm';
```

- [ ] **Step 3: Merge `station-coords.json` in `loadDevFixture`**

Replace the body of `loadDevFixture()` with this version (adds a coords lookup and `lat`/`lng` on each row):

```ts
async function loadDevFixture(): Promise<StationView[]> {
  if (devCache) return devCache;
  const path = resolve(process.cwd(), 'data/stations.dev.json');
  const raw = await readFile(path, 'utf-8').catch(() => '[]');
  const rows = JSON.parse(raw) as Array<{
    cecCode: string;
    district?: string;
    marz: string;
    community: string;
    settlement?: string | null;
    stationNumber: string;
    address: string;
    accessibility?: boolean;
  }>;

  // Harvested coordinates, keyed by precinct ("1/1"). Optional file — when it
  // is absent or a precinct is missing, lat/lng stay null.
  const coordsPath = resolve(process.cwd(), 'data/station-coords.json');
  const coordsRaw = await readFile(coordsPath, 'utf-8').catch(() => '{}');
  const coordsStore = JSON.parse(coordsRaw) as Record<
    string,
    { lat: number; lng: number }
  >;
  const normCec = (c: string) => {
    const [a, b] = c.split('/');
    return a && b ? `${Number(a)}/${Number(b)}` : c;
  };
  const coordByCec = new Map<string, { lat: number; lng: number }>();
  for (const [key, v] of Object.entries(coordsStore)) {
    if (typeof v?.lat === 'number' && typeof v?.lng === 'number') {
      coordByCec.set(normCec(key), { lat: v.lat, lng: v.lng });
    }
  }

  devCache = rows.map((s) => {
    const id = urlSafeId(s.cecCode);
    const district = s.district ?? s.cecCode.split('/')[0] ?? '';
    const coord = coordByCec.get(normCec(s.cecCode)) ?? null;
    return {
      id,
      cecCode: s.cecCode,
      district,
      marz: s.marz,
      community: s.community,
      settlement: s.settlement ?? null,
      stationNumber: s.stationNumber,
      address: s.address,
      accessibility: Boolean(s.accessibility),
      lat: coord?.lat ?? null,
      lng: coord?.lng ?? null,
      marzEn: armToLatin(s.marz),
      marzRu: armToCyrillic(s.marz),
      communityEn: armToLatin(s.community),
      communityRu: armToCyrillic(s.community),
      settlementEn: s.settlement ? armToLatin(s.settlement) : null,
      settlementRu: s.settlement ? armToCyrillic(s.settlement) : null,
    };
  });
  return devCache;
}
```

- [ ] **Step 4: Return `lat`/`lng` from `rowToView` (DB path)**

In `rowToView`, add the two fields (after `accessibility: row.accessibility,`):

```ts
    accessibility: row.accessibility,
    lat: row.lat,
    lng: row.lng,
```

- [ ] **Step 5: Add `GeoStation` type + `listGeolocatedStations` + `countStations`**

Append to `lib/stations.ts` (after `searchStations`):

```ts
export type GeoStation = {
  id: string;
  cecCode: string;
  lat: number;
  lng: number;
  label: string;
  stationNumber: string;
};

/** Stations that have coordinates, with a locale-resolved label, for the map. */
export async function listGeolocatedStations(
  locale: Locale,
): Promise<GeoStation[]> {
  const toGeo = (s: StationView): GeoStation | null => {
    if (s.lat == null || s.lng == null) return null;
    const label = localizedSettlement(s, locale) ?? localizedCommunity(s, locale);
    return {
      id: s.id,
      cecCode: s.cecCode,
      lat: s.lat,
      lng: s.lng,
      label,
      stationNumber: s.stationNumber,
    };
  };
  if (!hasDatabase) {
    const all = await loadDevFixture();
    return all.map(toGeo).filter((x): x is GeoStation => x !== null);
  }
  const rows = await getDb().query.stations.findMany({
    where: and(isNotNull(schema.stations.lat), isNotNull(schema.stations.lng)),
    orderBy: [asc(schema.stations.cecCode)],
  });
  return rows.map(rowToView).map(toGeo).filter((x): x is GeoStation => x !== null);
}

/** Total station count (for map coverage display). */
export async function countStations(): Promise<number> {
  if (!hasDatabase) return (await loadDevFixture()).length;
  const [row] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.stations);
  return row?.count ?? 0;
}
```

- [ ] **Step 6: Verify it compiles + coords merge works**

Run:
```bash
pnpm lint
npx tsx -e "import {getStationById, listGeolocatedStations, countStations} from './lib/stations'; (async()=>{const s=await getStationById('01-001'); console.log('1/1 coords:', s?.lat, s?.lng); console.log('geolocated:', (await listGeolocatedStations('am')).length, 'total:', await countStations());})()"
```
Expected: lint passes; prints `1/1 coords: 40.209585 44.566617`, `geolocated: <~80> total: 2005`.

- [ ] **Step 7: Commit**

```bash
git add lib/stations.ts
git commit -m "feat(stations): expose lat/lng and geolocated-station queries"
```

---

### Task 2: `mapsUrl` helper

**Files:**
- Create: `lib/maps.ts`

- [ ] **Step 1: Create the helper**

```ts
/**
 * Universal Google Maps deep link for a coordinate. Opens the user's maps app
 * on mobile (or Google Maps web on desktop). Matches CEC's own ShowOnMap, which
 * also uses Google Maps. Swap the provider here if ever needed.
 */
export function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
```

- [ ] **Step 2: Verify**

Run:
```bash
npx tsx -e "import {mapsUrl} from './lib/maps'; const u=mapsUrl(40.209585,44.566617); console.log(u); if(u!=='https://www.google.com/maps/search/?api=1&query=40.209585,44.566617'){process.exit(1)}"
```
Expected: prints `https://www.google.com/maps/search/?api=1&query=40.209585,44.566617`.

- [ ] **Step 3: Commit**

```bash
git add lib/maps.ts
git commit -m "feat(maps): add mapsUrl deep-link helper"
```

---

### Task 3: `MapLink` component

**Files:**
- Create: `components/MapLink.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { mapsUrl } from '@/lib/maps';
import { Button } from '@/components/ui/Button';

type Props = {
  lat: number | null;
  lng: number | null;
  /** Localized link text, e.g. t('openInMaps'). */
  label: string;
  variant?: 'button' | 'inline';
};

/**
 * Renders an external "Open in Maps" link for a station. Returns null when the
 * station has no coordinates — this is the single guard that enforces the
 * "omit when no coords" rule across the detail page and list cards.
 */
export function MapLink({ lat, lng, label, variant = 'button' }: Props) {
  if (lat == null || lng == null) return null;
  const href = mapsUrl(lat, lng);

  if (variant === 'inline') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring inline-flex items-center gap-1 rounded text-sm font-medium text-navy-700 hover:text-orange"
      >
        <span aria-hidden="true">📍</span> {label}
      </a>
    );
  }

  return (
    <Button
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant="secondary"
      size="sm"
    >
      <span aria-hidden="true" className="mr-1.5">📍</span>
      {label}
    </Button>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm lint`
Expected: PASS (no unused/type errors).

- [ ] **Step 3: Commit**

```bash
git add components/MapLink.tsx
git commit -m "feat(maps): add MapLink component (null when no coords)"
```

---

### Task 4: i18n — `Station.openInMaps`

**Files:**
- Modify: `messages/am.json`, `messages/en.json`, `messages/ru.json`

- [ ] **Step 1: Add the key to each `Station` block**

`messages/am.json` — add to the `"Station"` object (after `"stationNumber"`):
```json
    "stationNumber": "Տեղամասի համար",
    "openInMaps": "Բացել քարտեզում"
```

`messages/en.json` — `"Station"` object:
```json
    "stationNumber": "Station number",
    "openInMaps": "Open in Maps"
```

`messages/ru.json` — `"Station"` object:
```json
    "stationNumber": "Номер участка",
    "openInMaps": "Открыть на карте"
```
(Match the existing last key's value; only add the `openInMaps` line + the trailing comma on the previous line. Keep valid JSON.)

- [ ] **Step 2: Verify JSON is valid**

Run:
```bash
node -e "for(const f of ['am','en','ru']){const j=require('./messages/'+f+'.json'); if(!j.Station.openInMaps){console.error('missing in '+f);process.exit(1)} console.log(f, j.Station.openInMaps)}"
```
Expected: prints the three labels, no error.

- [ ] **Step 3: Commit**

```bash
git add messages/am.json messages/en.json messages/ru.json
git commit -m "i18n: add Station.openInMaps"
```

---

### Task 5: Map button on the station detail page

**Files:**
- Modify: `app/[locale]/s/[stationId]/page.tsx`

- [ ] **Step 1: Import `MapLink`**

Add to the imports (after the `Card` import):
```tsx
import { MapLink } from '@/components/MapLink';
```

- [ ] **Step 2: Render the button under the address**

In the `<header>`, immediately after the address `<p>` block (the one rendering `{t('address')}: ... {station.address}`) and before the `{station.accessibility ? ... }` block, insert:

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

- [ ] **Step 3: Verify in the dev server**

Run: `pnpm dev`, then visit:
- `http://localhost:3000/am/s/01-001` → an "📍 Բացել քարտեզում" button appears; clicking opens Google Maps at `40.209585,44.566617`.
- A station whose precinct is not in `station-coords.json` (e.g. `http://localhost:3000/am/s/01-010`) → no button.

Expected: button present only when coords exist; link query matches the saved coordinate.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/s/[stationId]/page.tsx"
git commit -m "feat(station): show Open-in-Maps button when coords exist"
```

---

### Task 6: Inline map links on list cards

**Files:**
- Modify: `app/[locale]/marz/[marz]/[community]/page.tsx`
- Modify: `app/[locale]/marz/page.tsx`

- [ ] **Step 1: Community page — import + render inline link**

In `app/[locale]/marz/[marz]/[community]/page.tsx`, add the import:
```tsx
import { MapLink } from '@/components/MapLink';
```

Then change each station `<li>` so the map link is a **sibling** of the card link (avoids nesting `<a>` inside `<a>`). Replace the `<li>` block:

```tsx
                  <li key={s.id}>
                    <a
                      href={`/${locale}/s/${s.id}`}
                      className="focus-ring block"
                    >
                      <Card accent="navy" className="hover:border-orange">
                        <div className="text-xs font-semibold uppercase tracking-widest text-orange">
                          {s.cecCode}
                        </div>
                        <div className="mt-1 font-display text-lg font-bold text-navy-900">
                          №{s.stationNumber}
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm text-navy-700">
                          {s.address}
                        </div>
                      </Card>
                    </a>
                    {s.lat != null && s.lng != null ? (
                      <div className="mt-1.5 px-1">
                        <MapLink
                          lat={s.lat}
                          lng={s.lng}
                          label={t('openInMaps')}
                          variant="inline"
                        />
                      </div>
                    ) : null}
                  </li>
```

- [ ] **Step 2: Search-results page — import + render inline link**

In `app/[locale]/marz/page.tsx`, add the import:
```tsx
import { MapLink } from '@/components/MapLink';
```

Replace the search-results `<li>` block with the card link plus a sibling MapLink:

```tsx
              <li key={s.id}>
                <a
                  href={`/${locale}/s/${s.id}`}
                  className="focus-ring block"
                >
                  <Card accent="navy" className="hover:border-orange">
                    <div className="text-xs font-semibold uppercase tracking-widest text-orange">
                      {s.cecCode}
                    </div>
                    <div className="mt-1 font-display text-lg font-bold text-navy-900">
                      {locale === 'en'
                        ? s.communityEn || s.community
                        : locale === 'ru'
                          ? s.communityRu || s.community
                          : s.community}
                      , №{s.stationNumber}
                    </div>
                    <div className="mt-1 text-sm text-navy-700">{s.address}</div>
                  </Card>
                </a>
                {s.lat != null && s.lng != null ? (
                  <div className="mt-1.5 px-1">
                    <MapLink
                      lat={s.lat}
                      lng={s.lng}
                      label={tStation('openInMaps')}
                      variant="inline"
                    />
                  </div>
                ) : null}
              </li>
```

- [ ] **Step 3: Verify**

Run: `pnpm lint && pnpm build`
Then `pnpm dev` and check:
- `http://localhost:3000/am/marz?q=Ավան` → result cards for geolocated stations show a "📍 Բացել քարտեզում" link beneath them; others don't.
- A community page with at least one geolocated station shows the inline link under that card only.

Expected: lint + build pass; inline links appear only on geolocated cards; no nested-anchor warnings.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/marz/[marz]/[community]/page.tsx" "app/[locale]/marz/page.tsx"
git commit -m "feat(stations): inline Open-in-Maps links on list/search cards"
```

---

## Phase 2 — Overview map page (Leaflet)

### Task 7: Add Leaflet dependencies

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install**

Run:
```bash
pnpm add leaflet@^1.9.4 react-leaflet@^5.0.0
pnpm add -D @types/leaflet
```
(react-leaflet v5 supports React 19, which Next 15 uses.)

- [ ] **Step 2: Verify install**

Run:
```bash
node -e "console.log(require('./package.json').dependencies['react-leaflet'], require('./package.json').dependencies['leaflet'])"
```
Expected: prints the two versions.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: add leaflet + react-leaflet for overview map"
```

---

### Task 8: `StationsMap` client component + SSR-safe loader

**Files:**
- Create: `components/StationsMap.tsx`
- Create: `components/MapView.tsx`

- [ ] **Step 1: Create the Leaflet map (`StationsMap.tsx`)**

```tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapsUrl } from '@/lib/maps';
import type { GeoStation } from '@/lib/stations';

// Leaflet's default marker images don't resolve through bundlers; pin them to
// the CDN so markers render reliably.
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function StationsMap({
  stations,
  locale,
  directionsLabel,
}: {
  stations: GeoStation[];
  locale: string;
  directionsLabel: string;
}) {
  return (
    <MapContainer
      center={[40.2, 44.9]}
      zoom={8}
      scrollWheelZoom={false}
      className="h-[70vh] w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={icon}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">
                {s.label}, №{s.stationNumber}
              </div>
              <div className="text-xs opacity-70">{s.cecCode}</div>
              <div className="mt-1 flex gap-3">
                <a href={`/${locale}/s/${s.id}`} className="underline">
                  {s.cecCode}
                </a>
                <a
                  href={mapsUrl(s.lat, s.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  📍 {directionsLabel}
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

- [ ] **Step 2: Create the SSR-safe loader (`MapView.tsx`)**

react-leaflet touches `window`, so it must not server-render. A server component can't pass `ssr: false` to `next/dynamic`, so wrap it in this client loader:

```tsx
'use client';

import dynamic from 'next/dynamic';
import type { GeoStation } from '@/lib/stations';

const StationsMap = dynamic(() => import('./StationsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] w-full items-center justify-center rounded-xl bg-navy-900/5 text-sm text-navy-700">
      …
    </div>
  ),
});

export function MapView(props: {
  stations: GeoStation[];
  locale: string;
  directionsLabel: string;
}) {
  return <StationsMap {...props} />;
}
```

- [ ] **Step 3: Verify**

Run: `pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/StationsMap.tsx components/MapView.tsx
git commit -m "feat(map): Leaflet StationsMap + SSR-safe loader"
```

---

### Task 9: Overview map page

**Files:**
- Create: `app/[locale]/map/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { listGeolocatedStations, countStations } from '@/lib/stations';
import { MapView } from '@/components/MapView';

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Map');
  const tStation = await getTranslations('Station');

  const stations = await listGeolocatedStations(locale);
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
        {stations.length > 0 ? (
          <MapView
            stations={stations}
            locale={locale}
            directionsLabel={tStation('openInMaps')}
          />
        ) : (
          <p className="text-navy-700">{t('empty')}</p>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm build` then `pnpm dev`, visit `http://localhost:3000/am/map`.
Expected: build passes; map renders with ~80 pins; coverage line reads "80 / 2005 …"; clicking a pin shows a popup with a working detail link and Maps link. Check `/en/map` and `/ru/map` too.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/map/page.tsx"
git commit -m "feat(map): national overview map page"
```

---

### Task 10: i18n — `Map` block + `Nav.map`

**Files:**
- Modify: `messages/am.json`, `messages/en.json`, `messages/ru.json`

- [ ] **Step 1: Add `Nav.map` to each `Nav` block**

`am.json` Nav: add `"map": "Քարտեզ"`. `en.json` Nav: `"map": "Map"`. `ru.json` Nav: `"map": "Карта"`. (Add a comma after the previous last key.)

- [ ] **Step 2: Add a top-level `Map` block to each file**

`messages/am.json`:
```json
  "Map": {
    "title": "Տեղամասերի քարտեզ",
    "coverage": "{mapped} / {total} տեղամաս քարտեզի վրա",
    "empty": "Կոորդինատները դեռ հասանելի չեն"
  },
```

`messages/en.json`:
```json
  "Map": {
    "title": "Polling-station map",
    "coverage": "{mapped} / {total} stations mapped",
    "empty": "Coordinates are not available yet"
  },
```

`messages/ru.json`:
```json
  "Map": {
    "title": "Карта избирательных участков",
    "coverage": "{mapped} / {total} участков на карте",
    "empty": "Координаты пока недоступны"
  },
```
(Place the block as a sibling of `Station`, e.g. right after the `Station` object. Keep valid JSON — mind commas.)

- [ ] **Step 3: Verify**

Run:
```bash
node -e "for(const f of ['am','en','ru']){const j=require('./messages/'+f+'.json'); if(!j.Map?.title||!j.Nav?.map){console.error('missing in '+f);process.exit(1)} console.log(f,'ok')}"
```
Expected: prints `am ok`, `en ok`, `ru ok`.

- [ ] **Step 4: Commit**

```bash
git add messages/am.json messages/en.json messages/ru.json
git commit -m "i18n: add Map block and Nav.map"
```

---

### Task 11: Add the Map link to navigation

**Files:**
- Modify: `components/Header.tsx`

- [ ] **Step 1: Add the link to `secondaryLinks`**

In `components/Header.tsx`, change the `secondaryLinks` array to include the map (between `info` and `stats`):

```tsx
  const secondaryLinks = [
    { href: `/${locale}/info`, label: t('info') },
    { href: `/${locale}/map`, label: t('map') },
    { href: `/${locale}/stats`, label: t('stats') },
    { href: `/${locale}/about`, label: t('about') },
  ];
```
(This array is also passed to `MobileMenu` as `links`, so the mobile menu picks it up automatically — no change needed there.)

- [ ] **Step 2: Verify**

Run: `pnpm dev`, load any page.
Expected: "Քարտեզ / Map / Карта" appears in the desktop nav and in the mobile menu; it links to `/<locale>/map`.

- [ ] **Step 3: Commit**

```bash
git add components/Header.tsx
git commit -m "feat(nav): add Map link to header and mobile menu"
```

---

### Task 12: Prod DB coords importer

**Files:**
- Create: `scripts/import-station-coords.ts`
- Modify: `package.json` (add script)

- [ ] **Step 1: Create the importer**

```ts
/**
 * Upsert harvested polling-station coordinates into the `stations` table.
 *
 * Source: data/station-coords.json — keyed by precinct ("1/1"), values include
 * { lat, lng }. Re-runnable as coverage grows. Requires DATABASE_URL.
 *
 *   pnpm import:coords
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { eq, sql } from 'drizzle-orm';
import { getDb, schema } from '../lib/db/client';

function urlSafeId(cecCode: string): string {
  const [a, b] = cecCode.split('/');
  if (!a || !b) return cecCode.replace(/\W+/g, '-');
  return `${a.padStart(2, '0')}-${b.padStart(3, '0')}`;
}

async function main() {
  const db = getDb();
  const path = resolve(
    process.cwd(),
    process.argv[2] ?? 'data/station-coords.json',
  );
  console.log(`[import-coords] reading ${path}`);
  const store = JSON.parse(await readFile(path, 'utf-8')) as Record<
    string,
    { precinct: string; lat: number; lng: number }
  >;
  const entries = Object.values(store).filter(
    (c) => typeof c.lat === 'number' && typeof c.lng === 'number',
  );
  console.log(`[import-coords] ${entries.length} coordinates`);

  let updated = 0;
  for (const c of entries) {
    const id = urlSafeId(c.precinct);
    const res = await db
      .update(schema.stations)
      .set({ lat: c.lat, lng: c.lng, updatedAt: sql`now()` })
      .where(eq(schema.stations.id, id));
    updated += 1;
    void res;
  }
  console.log(`[import-coords] updated ${updated} stations`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Add the npm script**

In `package.json` `scripts`, after `"import:stations"`:
```json
    "import:stations": "tsx scripts/import-stations.ts",
    "import:coords": "tsx scripts/import-station-coords.ts"
```

- [ ] **Step 3: Verify (typecheck only; no DB needed)**

Run: `pnpm lint`
Expected: PASS. (Running the importer itself requires `DATABASE_URL`; that's a deploy-time step, not part of local verification.)

- [ ] **Step 4: Commit**

```bash
git add scripts/import-station-coords.ts package.json
git commit -m "feat(db): add import:coords script to upsert station coordinates"
```

---

## Final verification

- [ ] `pnpm lint` passes.
- [ ] `pnpm build` passes.
- [ ] `pnpm dev` manual sweep:
  - `/am/s/01-001` → Maps button; a no-coords station → none.
  - `/am/marz?q=Ավան` → inline links only on geolocated cards.
  - `/am/map`, `/en/map`, `/ru/map` → pins render, coverage count correct, popup links work, nav link present.
