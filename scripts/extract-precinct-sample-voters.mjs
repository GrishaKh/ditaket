#!/usr/bin/env node
/**
 * Extract one sample voter (surname + name) from each precinct's public voter
 * list — a lookup key per precinct for resolving the official polling-station
 * coordinate via the CEC/MIA per-voter map ("ShowOnMap(lat,lng)").
 *
 *   Input : data/voter-lists-2026/{TEC}-{precinct}.xlsx  (public CEC lists)
 *   Output: data/voter-lists-2026/_meta/precinct-sample-voters.csv  (gitignored)
 *
 *   node scripts/extract-precinct-sample-voters.mjs
 */
import xlsx from "xlsx";
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIR = "data/voter-lists-2026";
const OUT = `${DIR}/_meta/precinct-sample-voters.csv`;

const stations = JSON.parse(readFileSync("data/stations.dev.json", "utf8"));
const norm = (c) => {
  const [d, n] = String(c).split(/[/-]/);
  return `${+d}/${+n}`;
};
const sMap = new Map(stations.map((s) => [norm(s.cecCode), s]));

const files = readdirSync(DIR)
  .filter((f) => f.endsWith(".xlsx"))
  .sort((a, b) => {
    const pa = a.replace(".xlsx", "").split("-").map(Number);
    const pb = b.replace(".xlsx", "").split("-").map(Number);
    return pa[0] - pb[0] || pa[1] - pb[1];
  });

const rows = [];
const skipped = [];
for (const f of files) {
  const wb = xlsx.read(readFileSync(join(DIR, f)), { type: "buffer" });
  const sh = wb.Sheets[wb.SheetNames[0]];
  const aoa = xlsx.utils.sheet_to_json(sh, { header: 1, defval: "", raw: false });
  const h = aoa.findIndex((r) => r.some((c) => String(c).trim() === "Ազգանուն"));
  if (h < 0) {
    skipped.push(`${f} (no header)`);
    continue;
  }
  const hdr = aoa[h].map((c) => String(c).trim());
  const iS = hdr.indexOf("Ազգանուն");
  const iN = hdr.indexOf("Անուն");
  const iB = hdr.indexOf("Ծննդյան ամսաթիվը, ամիսը, տարին");
  const first = aoa[h + 1];
  if (!first || !String(first[iS]).trim()) {
    skipped.push(`${f} (no voter)`);
    continue;
  }
  const code = norm(f.replace(".xlsx", "").replace("-", "/"));
  const st = sMap.get(code) || {};
  rows.push({
    code,
    surname: String(first[iS]).trim(),
    name: String(first[iN]).trim(),
    birth: iB >= 0 ? String(first[iB]).trim() : "",
    marz: st.marz || "",
    community: st.community || "",
    settlement: st.settlement || "",
    address: st.address || "",
  });
}

const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const head = ["precinct", "surname", "name", "birthdate", "marz", "community", "settlement", "station_address"];
const lines = [head.join(",")];
for (const r of rows)
  lines.push([r.code, r.surname, r.name, r.birth, r.marz, r.community, r.settlement, r.address].map(esc).join(","));
writeFileSync(OUT, "﻿" + lines.join("\n") + "\n");

console.log(`precincts with a sample voter: ${rows.length} / files: ${files.length}`);
console.log(`skipped: ${skipped.length}${skipped.length ? " → " + skipped.slice(0, 10).join("; ") : ""}`);
console.log(`output: ${OUT} (${(statSync(OUT).size / 1024).toFixed(0)} KB)`);
console.log("\n--- preview (first 15) ---");
for (const r of rows.slice(0, 15))
  console.log(`${r.code.padEnd(6)} | ${r.surname.padEnd(16)} | ${r.name.padEnd(12)} | ${r.birth} | ${r.marz} / ${r.community}`);
