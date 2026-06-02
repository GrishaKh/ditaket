#!/usr/bin/env node
/**
 * Fetch official polling-station coordinates (and accessibility metadata) from
 * the CEC AccessibilityMap API and rebuild the coordinate dataset.
 *
 * This is a PUBLIC, un-gated bulk endpoint that backs elections.am's
 * accessibility map — it returns every precinct with latitude/longitude in one
 * request, so it replaces the manual per-voter Register harvesting.
 *
 *   Source : https://www.elections.am/Accessibility/GetSubDistrictAccessibility?electionId=<id>
 *   Output : data/station-coords.json  (keyed by precinct "1/1" → {lat,lng,...})
 *            data/station-coords.csv   (Excel-friendly mirror)
 *
 *   node scripts/fetch-station-coords.mjs            # electionId 28826 (2026 NA)
 *   node scripts/fetch-station-coords.mjs 28826
 */
import { writeFileSync } from "node:fs";

const electionId = process.argv[2] ?? "28826";
const URL = `https://www.elections.am/Accessibility/GetSubDistrictAccessibility?electionId=${electionId}`;

const norm = (c) => {
  const [a, b] = String(c).split(/[/-]/);
  return a && b ? `${Number(a)}/${Number(b)}` : String(c);
};

const res = await fetch(URL, {
  headers: { "User-Agent": "ditaket-observer/1.0 (grisha.khachatrian@gmail.com)" },
});
if (!res.ok) {
  console.error(`[fetch-coords] HTTP ${res.status} from ${URL}`);
  process.exit(1);
}
const rows = await res.json();
console.log(`[fetch-coords] ${rows.length} records from AccessibilityMap (electionId ${electionId})`);

const store = {};
let skipped = 0;
let dups = 0;
for (const r of rows) {
  const lat = Number(r.latitude);
  const lng = Number(r.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
    skipped += 1;
    continue;
  }
  const precinct = norm(r.subdistrict);
  if (store[precinct]) {
    dups += 1;
    continue; // keep first occurrence
  }
  store[precinct] = {
    precinct,
    lat,
    lng,
    station: r.address ?? "",
    marz: r.regionName ?? "",
    community: r.communityName ?? "",
    source: "elections.am/AccessibilityMap",
    fetchedAt: new Date().toISOString(),
  };
}

const ordered = Object.values(store).sort((a, b) => {
  const [ad, an] = a.precinct.split("/").map(Number);
  const [bd, bn] = b.precinct.split("/").map(Number);
  return ad - bd || an - bn;
});

writeFileSync("data/station-coords.json", JSON.stringify(store, null, 2) + "\n");

const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const head = ["precinct", "lat", "lng", "station", "marz", "community", "source", "fetched_at"];
const lines = [head.join(",")];
for (const r of ordered)
  lines.push([r.precinct, r.lat, r.lng, r.station, r.marz, r.community, r.source, r.fetchedAt].map(esc).join(","));
writeFileSync("data/station-coords.csv", "﻿" + lines.join("\n") + "\n");

console.log(`[fetch-coords] wrote ${ordered.length} precincts (skipped ${skipped} no-coord, ${dups} duplicate) → data/station-coords.{json,csv}`);
