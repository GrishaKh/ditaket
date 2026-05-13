#!/usr/bin/env node
// Quick inspector: peek at the CEC XLSX schema before we trust an importer.
import xlsx from 'xlsx';
import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? 'data/cec-stations-raw.bin';
const buf = readFileSync(path);
const wb = xlsx.read(buf, { type: 'buffer' });
console.log('sheets:', wb.SheetNames);
const sh = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sh, { defval: '', raw: false });
console.log('row count:', rows.length);
console.log('first row keys:', Object.keys(rows[0] ?? {}));
console.log('first 3 rows:');
for (const r of rows.slice(0, 3)) console.log(JSON.stringify(r, null, 2));
console.log('last row:');
console.log(JSON.stringify(rows[rows.length - 1], null, 2));
