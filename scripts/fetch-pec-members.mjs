#!/usr/bin/env node
/**
 * Fetch precinct electoral commission (ԸԸՀ/PEC) members from the public CEC
 * export and write data/pec-members.json (keyed by precinct "1/1").
 *
 *   Source: https://www.elections.am/File/PecMembersToExcel?electionId=<id>
 *   node scripts/fetch-pec-members.mjs            # electionId 28826 (2026 NA)
 */
import xlsx from "xlsx";
import { writeFileSync } from "node:fs";

const electionId = process.argv[2] ?? "28826";
const URL = `https://www.elections.am/File/PecMembersToExcel?electionId=${electionId}`;
const norm = (c) => {
  const [a, b] = String(c).split(/[/-]/);
  return a && b ? `${Number(a)}/${Number(b)}` : String(c);
};
const ROLE = { "նախագահ": "chair", "քարտուղար": "secretary" };
const ORDER = { chair: 0, secretary: 1, member: 2 };

const res = await fetch(URL, {
  headers: { "User-Agent": "ditaket-observer/1.0 (grisha.khachatrian@gmail.com)" },
});
if (!res.ok) {
  console.error(`[pec] HTTP ${res.status} from ${URL}`);
  process.exit(1);
}
const buf = Buffer.from(await res.arrayBuffer());
const wb = xlsx.read(buf, { type: "buffer" });
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "", raw: false });
console.log(`[pec] ${rows.length} member rows from electionId ${electionId}`);

const store = {};
for (const r of rows) {
  const precinct = norm(r["Տեղամաս"]);
  const name = String(r["ՏԸՀ Անդամ"] ?? "").trim();
  if (!precinct || !name) continue;
  const role = ROLE[String(r["Պաշտոնը"] ?? "").trim()] ?? "member";
  const party = String(r["Նշանակվել է"] ?? "").replace(/\s+/g, " ").trim();
  const certificate = String(r["Վկայական"] ?? "").trim();
  (store[precinct] ??= []).push({ name, role, party, certificate });
}
for (const p of Object.keys(store)) store[p].sort((a, b) => ORDER[a.role] - ORDER[b.role]);

writeFileSync("data/pec-members.json", JSON.stringify(store, null, 2) + "\n");
const precincts = Object.keys(store).length;
const members = Object.values(store).reduce((n, m) => n + m.length, 0);
console.log(`[pec] wrote ${precincts} precincts, ${members} members → data/pec-members.json`);
