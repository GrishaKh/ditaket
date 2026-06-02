# Coordinate accuracy (verified vs approximate) — design

**Date:** 2026-06-02
**Status:** approved (design); pending implementation
**Author:** Ditaket mission (with Claude)

## Summary

Distinguish **verified** polling-station coordinates (the 80 we extracted via the
CEC Register / voter-list lookups) from **approximate** ones (the ~1,925 backfilled
from the AccessibilityMap bulk endpoint, which the mission deems approximate).
Show the distinction by **pin color + legend on the map** and a **small note on the
station detail page**.

## Background

- The 80 Register-sourced coordinates are trusted/accurate. (Recovered from git
  `6850d91:data/station-coords.json` — sources `cec-register` / `shared-building`.)
- The AccessibilityMap bulk (`data/station-coords.json`, 2,005) is approximate.
  (Cross-check note: the 80 happen to sit within ~3–4 m of the AccessibilityMap
  values, but only the 80 are *verified* — the rest are unverified.)

## Goals

- Each geolocated station is tagged `coordAccuracy: 'verified' | 'approximate'`.
- Map `/map`: 🟢 green pins = verified, 🟡 amber pins = approximate, with a legend
  showing counts.
- Detail page `/s/[id]`: a small muted note — verified → "ճշգրտված" tag;
  approximate → "մոտավոր տեղադիրք".
- Re-running the AccessibilityMap fetch never clobbers the verified set.

## Non-goals

- No change to the underlying coordinate values (verified ≈ approximate within a few
  meters anyway). No filtering/toggle by accuracy (deferred). No DB change.

## Data

- **`data/station-coords.verified.json`** (new) — the 80 verified entries
  (precinct → `{lat, lng, …, source}`), recovered from git. The accurate set.
- **`data/station-coords.json`** (existing) — AccessibilityMap bulk = approximate.
- `scripts/fetch-station-coords.mjs` continues to write only the bulk file; the
  verified file is maintained separately (append future manual verifications).

## Data layer (`lib/stations.ts`)

- Static-import both JSON files; build `VERIFIED` and `APPROX` maps keyed by
  `normCec`.
- `StationView` and `GeoStation` gain `coordAccuracy: 'verified' | 'approximate' | null`.
- Coordinate resolution per station: if precinct in `VERIFIED` → those coords,
  `coordAccuracy='verified'`; else if in `APPROX` → those coords,
  `'approximate'`; else `lat/lng=null`, `coordAccuracy=null`.
- Applies in both the dev-fixture path and `rowToView` (DB path), replacing the
  current single `COORD_BY_CEC` overlay.

## Map (`components/StationsMap.tsx` + `app/[locale]/map/page.tsx`)

- Replace the single image `L.icon` with two `L.divIcon`s (CSS pins, no image
  assets): green (`verified`) and amber (`approximate`); pick per marker by
  `s.coordAccuracy`.
- `GeoStation` already flows to the map; it now carries `coordAccuracy`.
- Add a **legend** above the map (server-rendered in the page): two colored dots
  with `Map.accVerified` / `Map.accApprox` labels and counts
  (`stations.filter(s => s.coordAccuracy==='verified').length`, etc.).

## Detail page (`app/[locale]/s/[stationId]/page.tsx`)

- Under the existing Maps button, render a small muted line based on
  `station.coordAccuracy`: `verified` → "✓ ճշգրտված", `approximate` →
  "📍 մոտավոր տեղադիրք". Nothing when `null`.

## i18n

`messages/{am,en,ru}.json` — add to the `Map` block: `accVerified`, `accApprox`;
add to `Station` block: `coordVerified`, `coordApprox`.

## Verification

No test runner. `npx tsc --noEmit` clean; `pnpm dev` checks:
- `/am/map` — green vs amber pins, legend counts (≈ 80 / ≈ 1925);
- `/am/s/01-001` (verified) shows "ճշգրտված"; a known approximate station shows
  "մոտավոր տեղադիրք".
- Confirm no member/coord data leak beyond intended (client gets only per-station
  `coordAccuracy` + coords already sent).

## Open questions

None. Default colors: green `#2e7d32`-ish, amber `#e0a800`-ish (final shades at impl).
