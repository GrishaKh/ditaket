# Polling-station map links + overview map — design

**Date:** 2026-06-01
**Status:** approved (design); pending spec review
**Author:** Ditaket mission (with Claude)

## Summary

Surface the polling-station coordinates we are harvesting (in
`data/station-coords.json`) on the public site so voters/observers can navigate
to a station, and add a national overview map of all geolocated stations.

The per-station action is a lightweight **"Open in Maps" deep link** (opens the
user's own maps app, no API key). A separate **overview map page** renders all
geolocated stations as pins using Leaflet + OpenStreetMap. Stations without
coordinates show **no map affordance at all** (we never point a voter at a
guessed location).

## Goals

- Let a user on a station's page tap one button and get directions in their maps app.
- Add the same one-tap link to station cards in community lists and search results.
- Provide a browse-by-map overview of all stations that have coordinates.
- Degrade gracefully: ~96% of stations have no coordinate yet — show nothing for them.
- Keep it key-free and low-cost (no Google Maps billing).

## Non-goals

- No embedded interactive map on the per-station detail page (deep link only there).
- No geocoding / address-based fallback (CEC addresses geocode unreliably; risk of misdirection).
- No new test framework (project has none today).
- Harvesting more coordinates is out of scope here (separate, ongoing — see
  `data/station-coords.json`).

## Decisions (locked)

| Question | Decision |
|---|---|
| Per-station map form | Deep-link "Open in Maps" button (Google Maps universal URL) |
| Where it appears | Detail page + list cards (community + search results) + new overview map page |
| No-coords stations | Omit the map affordance entirely |
| Map library (overview) | Leaflet + react-leaflet + OpenStreetMap tiles (no API key, client-only) |
| Tests | No test framework added; rely on `next lint` + `next build` + manual check |

## Data layer

**Coord source of truth:** `data/station-coords.json`, keyed by `cecCode`
(`"1/1"`), each entry `{ precinct, lat, lng, station, marz, community, source,
savedAt }`. It stays **separate** from `data/stations.dev.json` (the CEC registry
mirror) because it is actively appended during harvesting and carries provenance.

Changes in `lib/stations.ts`:

- Extend `StationView` with `lat: number | null` and `lng: number | null`.
- `loadDevFixture()`: after loading `stations.dev.json`, load
  `station-coords.json` **once** and merge `lat`/`lng` onto each station by
  `cecCode` (normalize both sides, e.g. `1/1`). Cache as today.
- `rowToView()` (DB path): return `row.lat` / `row.lng` (columns already exist
  in `lib/db/schema.ts`).
- New `listGeolocatedStations(): Promise<GeoStation[]>` returning only rows with
  both lat and lng, as a lightweight shape:
  `type GeoStation = { id: string; cecCode: string; lat: number; lng: number; label: string; stationNumber: string }`
  (`label` = localized community/settlement, resolved in the page).

**DB population (prod path):** new `scripts/import-station-coords.ts` (npm
`import:coords`) reads `station-coords.json` and upserts `lat`/`lng` into the
`stations` table by `cecCode`. Re-runnable as coverage grows. Mirrors the
existing `scripts/import-stations.ts` style.

## Components & pages

- **`lib/maps.ts`** — pure helper
  `mapsUrl(lat: number, lng: number): string` →
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`.

- **`components/MapLink.tsx`** — presentational, server-compatible. Props:
  `{ lat: number | null; lng: number | null; label: string; variant?: 'button' | 'inline' }`.
  Renders an external anchor (`target="_blank" rel="noopener noreferrer"`) using
  `mapsUrl`. **Returns `null` when `lat`/`lng` is missing** — this single guard
  is how "omit when no coords" is enforced everywhere.
  - `variant="button"` → styled like the existing `Button` (detail page).
  - `variant="inline"` → small 📍 text link (cards).

- **Station detail** `app/[locale]/s/[stationId]/page.tsx` — render
  `<MapLink variant="button" .../>` beneath the address block (only renders when
  coords exist).

- **Community list** `app/[locale]/marz/[marz]/[community]/page.tsx` and
  **search results** `app/[locale]/marz/page.tsx` — add `<MapLink variant="inline" .../>`
  to each station card.

- **Overview map** `app/[locale]/map/page.tsx` (server component):
  - loads `listGeolocatedStations()` and `listMarzes()`/total count,
  - renders a heading with coverage **"{mapped} / {total}"**,
  - passes the geolocated stations to `components/StationsMap.tsx`.

- **`components/StationsMap.tsx`** (`'use client'`): dynamically import
  react-leaflet with `{ ssr: false }`. OpenStreetMap tile layer, one `<Marker>`
  per station, `<Popup>` = station label + station № + link to `/[locale]/s/[id]`
  + an "Open in Maps" link. Import Leaflet CSS. Reasonable default center/zoom on
  Armenia. (Marker clustering is a future enhancement if marker count grows large.)

- **Navigation:** add a "Map" link to `components/Header.tsx` and
  `components/MobileMenu.tsx`.

## Dependencies

Add `leaflet`, `react-leaflet`, `@types/leaflet`. Leaflet CSS imported in the
client map component. The map renders client-only (`ssr: false`), so there is no
server cost and no API key.

## Internationalization

`messages/{am,en,ru}.json` — add keys:

- `Station.openInMaps` (button label, e.g. AM "Բացել քարտեզում")
- `Map.title`, `Map.intro`, `Map.coverage` (ICU: "{mapped} / {total}")
- nav label (e.g. `Nav.map` or existing nav namespace) — "Քարտեզ" / "Map" / "Карта"

`MapLink` inline variant reuses `Station.openInMaps` (or a shorter `Common.map`).

## NULL / empty handling

- `MapLink` returns `null` when coords are absent → no button on detail, no link
  on cards.
- Overview map shows only geolocated stations plus the coverage count, so the
  current sparsity (~80 / 2,005) is explained rather than looking broken.
- If `listGeolocatedStations()` is empty, the map page shows an empty-state note.

## Phasing

- **Phase 1 (no new deps, ships immediately):** data merge in `lib/stations.ts`,
  `lib/maps.ts`, `components/MapLink.tsx`, detail-page button, card links, i18n
  keys for the button.
- **Phase 2:** overview `/map` page, `StationsMap.tsx`, Leaflet deps, nav link,
  map i18n keys, `scripts/import-station-coords.ts`.

## Verification

Project has no test runner; not adding one.

- `npm run lint` and `npm run build` pass.
- Manual check (dev, no DB):
  - station **1/1** (has coords) → button present, opens Maps at `40.2096,44.5666`.
  - a station **without** coords → no button, no card link.
  - `/[locale]/map` → pins render, coverage count correct, popup links work, all 3 locales.

## Open questions

None blocking. Deep-link provider defaults to Google Maps (matches CEC's own
`ShowOnMap`); can be swapped to Yandex/2GIS later by changing `mapsUrl` only.
