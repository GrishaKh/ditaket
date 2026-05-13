/**
 * Seed the `violation_categories` table from the canonical list in
 * `lib/violations/categories.ts`. Idempotent — re-running upserts.
 *
 *   pnpm seed:categories
 */
import { sql } from 'drizzle-orm';
import { getDb, schema } from '../lib/db/client';
import { VIOLATION_CATEGORIES } from '../lib/violations/categories';

const db = getDb();

async function main() {
  const rows = VIOLATION_CATEGORIES.map((c) => ({
    id: c.id,
    labelAm: c.labelAm,
    labelEn: c.labelEn,
    labelRu: c.labelRu,
    descriptionAm: c.descriptionAm,
    descriptionEn: c.descriptionEn,
    descriptionRu: c.descriptionRu,
    ecArticle: c.ecArticle,
    severity: c.severity,
    sortOrder: c.sortOrder,
  }));

  console.log(`[seed-categories] upserting ${rows.length} categories...`);
  await db
    .insert(schema.violationCategories)
    .values(rows)
    .onConflictDoUpdate({
      target: schema.violationCategories.id,
      set: {
        labelAm: sql`excluded.label_am`,
        labelEn: sql`excluded.label_en`,
        labelRu: sql`excluded.label_ru`,
        descriptionAm: sql`excluded.description_am`,
        descriptionEn: sql`excluded.description_en`,
        descriptionRu: sql`excluded.description_ru`,
        ecArticle: sql`excluded.ec_article`,
        severity: sql`excluded.severity`,
        sortOrder: sql`excluded.sort_order`,
      },
    });
  console.log('[seed-categories] done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
