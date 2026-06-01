/**
 * Upsert harvested polling-station coordinates into the `stations` table.
 *
 * Source: data/station-coords.json — keyed by precinct ("1/1"), values include
 * { lat, lng }. Re-runnable as coverage grows. Requires DATABASE_URL.
 *
 *   pnpm import:coords
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { eq, sql } from 'drizzle-orm';
import { getDb, schema } from '../lib/db/client';

function urlSafeId(cecCode: string): string {
  const [a, b] = cecCode.split('/');
  if (!a || !b) return cecCode.replace(/\W+/g, '-');
  return `${a.padStart(2, '0')}-${b.padStart(3, '0')}`;
}

async function main() {
  const db = getDb();
  const path = resolve(
    process.cwd(),
    process.argv[2] ?? 'data/station-coords.json',
  );
  console.log(`[import-coords] reading ${path}`);
  const store = JSON.parse(await readFile(path, 'utf-8')) as Record<
    string,
    { precinct: string; lat: number; lng: number }
  >;
  const entries = Object.values(store).filter(
    (c) => typeof c.lat === 'number' && typeof c.lng === 'number',
  );
  console.log(`[import-coords] ${entries.length} coordinates`);

  let updated = 0;
  let notFound = 0;
  for (const c of entries) {
    const id = urlSafeId(c.precinct);
    const res = await db
      .update(schema.stations)
      .set({ lat: c.lat, lng: c.lng, updatedAt: sql`now()` })
      .where(eq(schema.stations.id, id));
    if ((res.rowCount ?? 0) > 0) updated += 1;
    else notFound += 1;
  }
  console.log(
    `[import-coords] updated ${updated} stations` +
      (notFound ? ` (${notFound} precincts had no matching station row)` : ''),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
