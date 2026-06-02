#!/usr/bin/env node
/**
 * Upsert one polling-station coordinate (harvested from the CEC Register's
 * ShowOnMap(lat,lng,...) result) into the VERIFIED coordinate dataset.
 * (Register coords are authoritative; the approximate AccessibilityMap bulk
 * lives in data/station-coords.json and is owned by fetch-station-coords.mjs.)
 *
 *   data/station-coords.verified.json  — keyed store (source of truth)
 *   data/station-coords.verified.csv   — flat mirror (Excel-friendly, UTF-8 BOM)
 *
 * Usage:
 *   node scripts/save-station-coord.mjs <precinct> <lat> <lng> ["station comment"]
 *   e.g. node scripts/save-station-coord.mjs 1/1 40.209585 44.566617 "Թիվ 51 մ/մանկապարտեզ..."
 *
 * Re-running with the same precinct overwrites that row (safe to repeat).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const [precinctArg, latArg, lngArg, comment = "", sourceArg = "cec-register"] = process.argv.slice(2);
if (!precinctArg || !latArg || !lngArg) {
  console.error('usage: save-station-coord.mjs <precinct> <lat> <lng> ["comment"]');
  process.exit(2);
}
const norm = (c) => {
  const [d, n] = String(c).split(/[/-]/);
  return `${+d}/${+n}`;
};
const precinct = norm(precinctArg);
const lat = Number(latArg);
const lng = Number(lngArg);
if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
  console.error(`bad coords: ${latArg}, ${lngArg}`);
  process.exit(2);
}

const JSON_PATH = "data/station-coords.verified.json";
const CSV_PATH = "data/station-coords.verified.csv";

// cross-check against the registry address for context
const stations = JSON.parse(readFileSync("data/stations.dev.json", "utf8"));
const sMap = new Map(stations.map((s) => [norm(s.cecCode), s]));
const st = sMap.get(precinct) || {};

const store = existsSync(JSON_PATH) ? JSON.parse(readFileSync(JSON_PATH, "utf8")) : {};
store[precinct] = {
  precinct,
  lat,
  lng,
  station: comment || st.address || "",
  marz: st.marz || "",
  community: st.community || "",
  registry_address: st.address || "",
  source: sourceArg,
  savedAt: new Date().toISOString(),
};
writeFileSync(JSON_PATH, JSON.stringify(store, null, 2) + "\n");

// CSV mirror, sorted by precinct (district, then station)
const rows = Object.values(store).sort((a, b) => {
  const [ad, an] = a.precinct.split("/").map(Number);
  const [bd, bn] = b.precinct.split("/").map(Number);
  return ad - bd || an - bn;
});
const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const head = ["precinct", "lat", "lng", "station", "marz", "community", "source", "saved_at"];
const lines = [head.join(",")];
for (const r of rows)
  lines.push([r.precinct, r.lat, r.lng, r.station, r.marz, r.community, r.source, r.savedAt].map(esc).join(","));
writeFileSync(CSV_PATH, "﻿" + lines.join("\n") + "\n");

const total = stations.length;
console.log(`✓ saved ${precinct} → ${lat}, ${lng}`);
console.log(`  registry address: ${st.address || "(precinct not in registry)"}`);
console.log(`  dataset: ${rows.length} / ${total} precincts have coords → ${JSON_PATH}, ${CSV_PATH}`);
