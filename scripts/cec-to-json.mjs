#!/usr/bin/env node
/**
 * Convert the CEC polling-station XLSX into our JSON shape.
 * Source: data/cec-stations-raw.bin (downloaded once via curl from
 *   https://www.elections.am/File/SubDistrictsToExcel?electionId=28826)
 *
 * Output: data/stations.dev.json (consumed by lib/stations.ts as the dev
 * fallback when DATABASE_URL is not set, and also as the input to
 * scripts/import-stations.ts for the prod DB).
 *
 *   node scripts/cec-to-json.mjs
 */
import xlsx from 'xlsx';
import { readFile, writeFile } from 'node:fs/promises';

const SRC = process.argv[2] ?? 'data/cec-stations-raw.bin';
const DST = process.argv[3] ?? 'data/stations.dev.json';

const buf = await readFile(SRC);
const wb = xlsx.read(buf, { type: 'buffer' });
const sh = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sh, { defval: '', raw: false });

const out = [];
for (const r of rows) {
  const cecCode = String(r['ՏԸՀ'] ?? '').trim();
  if (!cecCode) continue;
  const [district, station] = cecCode.split('/');
  if (!district || !station) {
    console.warn(`skip: bad cecCode ${cecCode}`);
    continue;
  }
  out.push({
    cecCode,
    district: String(r['ԸԸՀ'] ?? district).trim(),
    marz: String(r['Մարզ'] ?? '').trim(),
    community: String(r['Համայնք'] ?? '').trim(),
    settlement: String(r['Բնակավայր'] ?? '').trim() || null,
    stationNumber: station.trim(),
    address: String(r['Հասցե'] ?? '').trim(),
    accessibility: false, // not in this file; merged from a separate CEC export later
  });
}

await writeFile(DST, JSON.stringify(out, null, 2));
console.log(`✓ ${out.length} stations → ${DST}`);

// Distribution summary
const byMarz = new Map();
for (const s of out) byMarz.set(s.marz, (byMarz.get(s.marz) ?? 0) + 1);
const sorted = [...byMarz.entries()].sort((a, b) => b[1] - a[1]);
console.log('--- by marz ---');
for (const [m, c] of sorted) console.log(`  ${m.padEnd(20)} ${c}`);
