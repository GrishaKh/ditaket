/**
 * Import CEC polling-station registry into the `stations` table.
 *
 * The CEC publishes the registry as Excel at:
 *   https://www.elections.am/Elections/Parliamentary
 *
 * To avoid pulling in an XLSX parser as a runtime dep, this script reads
 * a JSON file you produce ONCE by converting the CEC Excel. Recommended:
 *
 *   1. Download the polling-station Excel from elections.am
 *   2. Open it (LibreOffice, Excel, Google Sheets)
 *   3. Save-as → CSV or JSON
 *   4. Massage into the schema below if needed:
 *
 *      [
 *        {
 *          "cecCode": "1/01",
 *          "marz": "Երևան",
 *          "community": "Կենտրոն",
 *          "stationNumber": "01",
 *          "address": "Բուզանդի 1/3, Թիվ 1 դպրոց",
 *          "accessibility": false
 *        },
 *        ...
 *      ]
 *
 *   5. Save as `data/stations.import.json` and run:
 *
 *      pnpm import:stations
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sql } from 'drizzle-orm';
import { getDb, schema } from '../lib/db/client';
import { armToLatin, armToCyrillic } from './transliterate';

const db = getDb();

type RawStation = {
  cecCode: string;
  marz: string;
  community: string;
  stationNumber: string;
  address: string;
  accessibility?: boolean;
};

function urlSafeId(cecCode: string): string {
  // "1/05" → "01-005", "13/124" → "13-124"
  const [a, b] = cecCode.split('/');
  if (!a || !b) return cecCode.replace(/\W+/g, '-');
  return `${a.padStart(2, '0')}-${b.padStart(3, '0')}`;
}

async function main() {
  const inputPath = resolve(
    process.cwd(),
    process.argv[2] ?? 'data/stations.import.json',
  );
  console.log(`[import-stations] reading ${inputPath}`);
  const raw = await readFile(inputPath, 'utf-8');
  const stations: RawStation[] = JSON.parse(raw);

  console.log(`[import-stations] parsed ${stations.length} stations`);
  if (stations.length < 1500 || stations.length > 2200) {
    console.warn(
      `[import-stations] unusual count (${stations.length}). CEC expects ~2,005. Verify your source data.`,
    );
  }

  const rows = stations.map((s) => ({
    id: urlSafeId(s.cecCode),
    cecCode: s.cecCode,
    district: (s as { district?: string }).district ?? s.cecCode.split('/')[0] ?? '',
    marz: s.marz,
    community: s.community,
    settlement: (s as { settlement?: string | null }).settlement ?? null,
    stationNumber: s.stationNumber,
    address: s.address,
    accessibility: Boolean(s.accessibility),
    marzEn: armToLatin(s.marz),
    marzRu: armToCyrillic(s.marz),
    communityEn: armToLatin(s.community),
    communityRu: armToCyrillic(s.community),
    settlementEn: (s as { settlement?: string | null }).settlement
      ? armToLatin((s as { settlement: string }).settlement)
      : null,
    settlementRu: (s as { settlement?: string | null }).settlement
      ? armToCyrillic((s as { settlement: string }).settlement)
      : null,
  }));

  console.log(`[import-stations] upserting...`);
  // Insert in batches of 200 (Neon HTTP has a request-size limit)
  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await db
      .insert(schema.stations)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.stations.id,
        set: {
          district: sql`excluded.district`,
          marz: sql`excluded.marz`,
          community: sql`excluded.community`,
          settlement: sql`excluded.settlement`,
          stationNumber: sql`excluded.station_number`,
          address: sql`excluded.address`,
          accessibility: sql`excluded.accessibility`,
          marzEn: sql`excluded.marz_en`,
          marzRu: sql`excluded.marz_ru`,
          communityEn: sql`excluded.community_en`,
          communityRu: sql`excluded.community_ru`,
          settlementEn: sql`excluded.settlement_en`,
          settlementRu: sql`excluded.settlement_ru`,
          updatedAt: sql`now()`,
        },
      });
    process.stdout.write(`  ${Math.min(i + BATCH, rows.length)}/${rows.length}\r`);
  }
  console.log(`\n[import-stations] done.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
