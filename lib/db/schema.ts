import {
  pgTable,
  text,
  integer,
  boolean,
  real,
  timestamp,
  date,
  uuid,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';

/**
 * Polling stations — sourced from the CEC registry
 *   https://www.elections.am/File/SubDistrictsToExcel?electionId=28826
 *
 * CEC columns (raw Armenian) → our fields:
 *   Մարզ      → marz
 *   Համայնք   → community
 *   Բնակավայր → settlement (NULL for urban communities)
 *   ԸԸՀ      → district     (territorial electoral commission #, "1".."38")
 *   ՏԸՀ      → cecCode      ("1/1", "38/55"), parsed into district + stationNumber
 *   Հասցե     → address
 */
export const stations = pgTable(
  'stations',
  {
    id: text('id').primaryKey(), // URL-safe e.g. '01-001'
    cecCode: text('cec_code').notNull(), // raw CEC code '1/1'
    district: text('district').notNull(), // ԸԸՀ, '1'..'38'
    marz: text('marz').notNull(),
    community: text('community').notNull(),
    settlement: text('settlement'), // Բնակավայր (nullable; empty for urban)
    stationNumber: text('station_number').notNull(),
    address: text('address').notNull(),
    accessibility: boolean('accessibility').notNull().default(false),
    lat: real('lat'),
    lng: real('lng'),
    // v2 (CEC stream embeds)
    liveStreamUrl: text('live_stream_url'),
    streamStatus: text('stream_status'), // 'online' | 'offline' | 'unknown'
    // Transliterations (cached)
    marzEn: text('marz_en'),
    marzRu: text('marz_ru'),
    communityEn: text('community_en'),
    communityRu: text('community_ru'),
    settlementEn: text('settlement_en'),
    settlementRu: text('settlement_ru'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    marzIdx: index('stations_marz_idx').on(t.marz),
    communityIdx: index('stations_community_idx').on(t.marz, t.community),
    districtIdx: index('stations_district_idx').on(t.district),
  }),
);

export const violationCategories = pgTable('violation_categories', {
  id: text('id').primaryKey(),
  labelAm: text('label_am').notNull(),
  labelEn: text('label_en').notNull(),
  labelRu: text('label_ru').notNull(),
  descriptionAm: text('description_am').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionRu: text('description_ru').notNull(),
  ecArticle: text('ec_article').notNull(),
  severity: integer('severity').notNull(), // 1..5
  sortOrder: integer('sort_order').notNull().default(0),
});

// Event-sourced timeline. User reports today; AI client events in v3 use the
// same table with source='ai_client'.
export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stationId: text('station_id')
      .notNull()
      .references(() => stations.id, { onDelete: 'cascade' }),
    source: text('source').notNull(), // 'user_report' | 'ai_client' | 'moderator_note' | 'system'
    categoryId: text('category_id').references(() => violationCategories.id),
    description: text('description').notNull().default(''),
    evidenceUrl: text('evidence_url'),
    confidence: real('confidence'), // 0..1, NULL for user reports
    moderationStatus: text('moderation_status').notNull().default('pending'),
    // 'pending' | 'approved' | 'rejected' | 'flagged'
    reporterFingerprint: text('reporter_fingerprint').notNull(),
    moderatorNote: text('moderator_note'),
    moderatedAt: timestamp('moderated_at'),
    moderatedByRole: text('moderated_by_role'),
    locale: text('locale').notNull().default('am'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    stationIdx: index('events_station_idx').on(t.stationId, t.createdAt),
    moderationIdx: index('events_moderation_idx').on(t.moderationStatus, t.createdAt),
    fingerprintIdx: index('events_fingerprint_idx').on(t.reporterFingerprint, t.createdAt),
  }),
);

export const statsSnapshots = pgTable(
  'stats_snapshots',
  {
    snapshotDate: date('snapshot_date').notNull(),
    marz: text('marz').notNull().default(''),
    categoryId: text('category_id').notNull().default(''),
    totalReports: integer('total_reports').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.snapshotDate, t.marz, t.categoryId] }),
  }),
);

export type Station = typeof stations.$inferSelect;
export type NewStation = typeof stations.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type ViolationCategory = typeof violationCategories.$inferSelect;
