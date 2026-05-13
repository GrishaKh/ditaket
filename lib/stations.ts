/**
 * Data access for polling stations. Backed by Postgres when DATABASE_URL is
 * present, otherwise falls back to `data/stations.dev.json` so the dev server
 * works without provisioning a DB.
 *
 * Source: CEC registry — Մարզ / Համայնք / Բնակավայր / ԸԸՀ / ՏԸՀ / Հասցե
 *   https://www.elections.am/File/SubDistrictsToExcel?electionId=28826
 */
import { and, eq, ilike, or, sql, asc } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getDb, hasDatabase, schema } from './db/client';
import { armToLatin, armToCyrillic } from '../scripts/transliterate';
import type { Locale } from './i18n/routing';

export type StationView = {
  id: string;
  cecCode: string;
  district: string;
  marz: string;
  community: string;
  settlement: string | null;
  stationNumber: string;
  address: string;
  accessibility: boolean;
  marzEn: string;
  marzRu: string;
  communityEn: string;
  communityRu: string;
  settlementEn: string | null;
  settlementRu: string | null;
};

let devCache: StationView[] | null = null;

function urlSafeId(cecCode: string): string {
  // "1/1" → "01-001", "38/55" → "38-055"
  const [a, b] = cecCode.split('/');
  if (!a || !b) return cecCode.replace(/\W+/g, '-');
  return `${a.padStart(2, '0')}-${b.padStart(3, '0')}`;
}

async function loadDevFixture(): Promise<StationView[]> {
  if (devCache) return devCache;
  const path = resolve(process.cwd(), 'data/stations.dev.json');
  const raw = await readFile(path, 'utf-8').catch(() => '[]');
  const rows = JSON.parse(raw) as Array<{
    cecCode: string;
    district?: string;
    marz: string;
    community: string;
    settlement?: string | null;
    stationNumber: string;
    address: string;
    accessibility?: boolean;
  }>;
  devCache = rows.map((s) => {
    const id = urlSafeId(s.cecCode);
    const district = s.district ?? s.cecCode.split('/')[0] ?? '';
    return {
      id,
      cecCode: s.cecCode,
      district,
      marz: s.marz,
      community: s.community,
      settlement: s.settlement ?? null,
      stationNumber: s.stationNumber,
      address: s.address,
      accessibility: Boolean(s.accessibility),
      marzEn: armToLatin(s.marz),
      marzRu: armToCyrillic(s.marz),
      communityEn: armToLatin(s.community),
      communityRu: armToCyrillic(s.community),
      settlementEn: s.settlement ? armToLatin(s.settlement) : null,
      settlementRu: s.settlement ? armToCyrillic(s.settlement) : null,
    };
  });
  return devCache;
}

export function localizedMarz(s: StationView, locale: Locale) {
  if (locale === 'en') return s.marzEn || s.marz;
  if (locale === 'ru') return s.marzRu || s.marz;
  return s.marz;
}

export function localizedCommunity(s: StationView, locale: Locale) {
  if (locale === 'en') return s.communityEn || s.community;
  if (locale === 'ru') return s.communityRu || s.community;
  return s.community;
}

export function localizedSettlement(
  s: StationView,
  locale: Locale,
): string | null {
  if (!s.settlement) return null;
  if (locale === 'en') return s.settlementEn || s.settlement;
  if (locale === 'ru') return s.settlementRu || s.settlement;
  return s.settlement;
}

export async function getStationById(id: string): Promise<StationView | null> {
  if (!hasDatabase) {
    const all = await loadDevFixture();
    return all.find((s) => s.id === id) ?? null;
  }
  const row = await getDb().query.stations.findFirst({
    where: eq(schema.stations.id, id),
  });
  return row ? rowToView(row) : null;
}

export async function listMarzes(): Promise<
  { marz: string; marzEn: string; marzRu: string; count: number }[]
> {
  if (!hasDatabase) {
    const all = await loadDevFixture();
    const grouped = new Map<
      string,
      { marz: string; marzEn: string; marzRu: string; count: number }
    >();
    for (const s of all) {
      const cur = grouped.get(s.marz);
      if (cur) cur.count += 1;
      else
        grouped.set(s.marz, {
          marz: s.marz,
          marzEn: s.marzEn,
          marzRu: s.marzRu,
          count: 1,
        });
    }
    return [...grouped.values()].sort((a, b) => b.count - a.count);
  }
  const rows = await getDb()
    .select({
      marz: schema.stations.marz,
      marzEn: schema.stations.marzEn,
      marzRu: schema.stations.marzRu,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.stations)
    .groupBy(
      schema.stations.marz,
      schema.stations.marzEn,
      schema.stations.marzRu,
    )
    .orderBy(sql`count(*) desc`);
  return rows.map((r) => ({
    marz: r.marz,
    marzEn: r.marzEn ?? '',
    marzRu: r.marzRu ?? '',
    count: r.count,
  }));
}

export async function listCommunitiesInMarz(
  marz: string,
): Promise<
  {
    community: string;
    communityEn: string;
    communityRu: string;
    count: number;
  }[]
> {
  if (!hasDatabase) {
    const all = await loadDevFixture();
    const grouped = new Map<
      string,
      {
        community: string;
        communityEn: string;
        communityRu: string;
        count: number;
      }
    >();
    for (const s of all) {
      if (s.marz !== marz && s.marzEn.toLowerCase() !== marz.toLowerCase() && s.marzRu !== marz)
        continue;
      const cur = grouped.get(s.community);
      if (cur) cur.count += 1;
      else
        grouped.set(s.community, {
          community: s.community,
          communityEn: s.communityEn,
          communityRu: s.communityRu,
          count: 1,
        });
    }
    return [...grouped.values()].sort((a, b) => b.count - a.count);
  }
  const rows = await getDb()
    .select({
      community: schema.stations.community,
      communityEn: schema.stations.communityEn,
      communityRu: schema.stations.communityRu,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.stations)
    .where(
      or(
        eq(schema.stations.marz, marz),
        eq(schema.stations.marzEn, marz),
        eq(schema.stations.marzRu, marz),
      ),
    )
    .groupBy(
      schema.stations.community,
      schema.stations.communityEn,
      schema.stations.communityRu,
    )
    .orderBy(sql`count(*) desc`);
  return rows.map((r) => ({
    community: r.community,
    communityEn: r.communityEn ?? '',
    communityRu: r.communityRu ?? '',
    count: r.count,
  }));
}

export async function listStationsInCommunity(
  marz: string,
  community: string,
): Promise<StationView[]> {
  if (!hasDatabase) {
    const all = await loadDevFixture();
    return all
      .filter(
        (s) =>
          (s.marz === marz ||
            s.marzEn.toLowerCase() === marz.toLowerCase() ||
            s.marzRu === marz) &&
          (s.community === community ||
            s.communityEn.toLowerCase() === community.toLowerCase() ||
            s.communityRu === community),
      )
      .sort((a, b) => a.cecCode.localeCompare(b.cecCode, 'hy'));
  }
  const rows = await getDb().query.stations.findMany({
    where: and(
      or(
        eq(schema.stations.marz, marz),
        eq(schema.stations.marzEn, marz),
        eq(schema.stations.marzRu, marz),
      ),
      or(
        eq(schema.stations.community, community),
        eq(schema.stations.communityEn, community),
        eq(schema.stations.communityRu, community),
      ),
    ),
    orderBy: [asc(schema.stations.cecCode)],
  });
  return rows.map(rowToView);
}

export async function listStationsInMarz(
  marz: string,
): Promise<StationView[]> {
  if (!hasDatabase) {
    const all = await loadDevFixture();
    return all
      .filter(
        (s) =>
          s.marz === marz ||
          s.marzEn.toLowerCase() === marz.toLowerCase() ||
          s.marzRu === marz,
      )
      .sort((a, b) => a.cecCode.localeCompare(b.cecCode, 'hy'));
  }
  const rows = await getDb().query.stations.findMany({
    where: or(
      eq(schema.stations.marz, marz),
      eq(schema.stations.marzEn, marz),
      eq(schema.stations.marzRu, marz),
    ),
    orderBy: [asc(schema.stations.cecCode)],
  });
  return rows.map(rowToView);
}

export async function searchStations(q: string): Promise<StationView[]> {
  const term = q.trim();
  if (!term) return [];
  if (!hasDatabase) {
    const all = await loadDevFixture();
    const lower = term.toLowerCase();
    return all
      .filter(
        (s) =>
          s.cecCode.toLowerCase().includes(lower) ||
          s.id.toLowerCase().includes(lower) ||
          s.address.toLowerCase().includes(lower) ||
          s.community.toLowerCase().includes(lower) ||
          s.communityEn.toLowerCase().includes(lower) ||
          s.communityRu.toLowerCase().includes(lower) ||
          (s.settlement?.toLowerCase().includes(lower) ?? false) ||
          (s.settlementEn?.toLowerCase().includes(lower) ?? false) ||
          (s.settlementRu?.toLowerCase().includes(lower) ?? false) ||
          s.marz.toLowerCase().includes(lower) ||
          s.marzEn.toLowerCase().includes(lower) ||
          s.marzRu.toLowerCase().includes(lower),
      )
      .slice(0, 50);
  }
  const pattern = `%${term}%`;
  const rows = await getDb().query.stations.findMany({
    where: or(
      ilike(schema.stations.cecCode, pattern),
      ilike(schema.stations.address, pattern),
      ilike(schema.stations.community, pattern),
      ilike(schema.stations.communityEn, pattern),
      ilike(schema.stations.communityRu, pattern),
      ilike(schema.stations.settlement, pattern),
      ilike(schema.stations.marz, pattern),
    ),
    limit: 50,
    orderBy: [asc(schema.stations.cecCode)],
  });
  return rows.map(rowToView);
}

function rowToView(row: typeof schema.stations.$inferSelect): StationView {
  return {
    id: row.id,
    cecCode: row.cecCode,
    district: row.district,
    marz: row.marz,
    community: row.community,
    settlement: row.settlement,
    stationNumber: row.stationNumber,
    address: row.address,
    accessibility: row.accessibility,
    marzEn: row.marzEn ?? '',
    marzRu: row.marzRu ?? '',
    communityEn: row.communityEn ?? '',
    communityRu: row.communityRu ?? '',
    settlementEn: row.settlementEn,
    settlementRu: row.settlementRu,
  };
}
