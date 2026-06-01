#!/usr/bin/env node
/**
 * Batch-upsert polling-station coordinates read from the CEC Register result
 * pages the user navigated to (one human CAPTCHA per search, site-served pages).
 *
 *   node scripts/save-station-coords-batch.mjs <rows.json> [source]
 *
 * rows.json: [{ precinct, lat, lng, comment }]
 * Merges into data/station-coords.json + rewrites data/station-coords.csv.
 * Only precinct -> coordinate is persisted; NO voter PII is stored.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const [rowsPath, source = "cec-register"] = process.argv.slice(2);
if (!rowsPath) {
  console.error("usage: save-station-coords-batch.mjs <rows.json> [source]");
  process.exit(2);
}
const norm = (c) => { const [d, n] = String(c).split(/[/-]/); return `${+d}/${+n}`; };

const stations = JSON.parse(readFileSync("data/stations.dev.json", "utf8"));
const sMap = new Map(stations.map((s) => [norm(s.cecCode), s]));

const JSON_PATH = "data/station-coords.json";
const CSV_PATH = "data/station-coords.csv";
const store = existsSync(JSON_PATH) ? JSON.parse(readFileSync(JSON_PATH, "utf8")) : {};

const rows = JSON.parse(readFileSync(rowsPath, "utf8"));
let added = 0, updated = 0, skipped = 0;
for (const r of rows) {
  const precinct = norm(r.precinct);
  const lat = Number(r.lat), lng = Number(r.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) { skipped++; continue; }
  if (store[precinct]) updated++; else added++;
  const st = sMap.get(precinct) || {};
  store[precinct] = {
    precinct, lat, lng,
    station: r.comment || st.address || "",
    marz: st.marz || "", community: st.community || "",
    registry_address: st.address || "",
    source, savedAt: new Date().toISOString(),
  };
}
writeFileSync(JSON_PATH, JSON.stringify(store, null, 2) + "\n");

const ordered = Object.values(store).sort((a, b) => {
  const [ad, an] = a.precinct.split("/").map(Number);
  const [bd, bn] = b.precinct.split("/").map(Number);
  return ad - bd || an - bn;
});
const esc = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const head = ["precinct", "lat", "lng", "station", "marz", "community", "source", "saved_at"];
const lines = [head.join(",")];
for (const r of ordered) lines.push([r.precinct, r.lat, r.lng, r.station, r.marz, r.community, r.source, r.savedAt].map(esc).join(","));
writeFileSync(CSV_PATH, "﻿" + lines.join("\n") + "\n");

console.log(`batch: +${added} new, ${updated} updated, ${skipped} skipped`);
console.log(`dataset: ${ordered.length} / ${stations.length} precincts have coords`);
