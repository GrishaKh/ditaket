import { and, desc, asc, eq, ilike, inArray, or, sql, gte, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { VIOLATION_CATEGORIES } from "@/lib/violations/categories";

export type AdminStatus = "pending" | "flagged" | "approved" | "rejected" | "all";
export type AdminSort = "newest" | "oldest" | "severity";

export type AdminFilters = {
  status: AdminStatus;
  category: string;
  marz: string;
  severity: string;
  source: string;
  q: string;
  sort: AdminSort;
};

export type AdminEventRow = {
  id: string;
  stationId: string;
  categoryId: string | null;
  categoryLabel: string;
  ecArticle: string;
  severity: number;
  description: string;
  source: string;
  locale: string;
  createdAt: string;
  marz: string;
  community: string;
  address: string;
  stationNumber: string;
  reporterFingerprint: string;
  reporterLat: number | null;
  reporterLng: number | null;
  reporterAccuracyM: number | null;
  reporterGeoCapturedAt: string | null;
  moderationStatus: string;
  moderatorNote: string | null;
  moderatedAt: string | null;
  fingerprintCount: number;
  stationCount: number;
};

export type StatusCounts = {
  pending: number;
  flagged: number;
  approved: number;
  rejected: number;
  all: number;
};

export type AdminStats = {
  todayTotal: number;
  todayHighSeverity: number;
  past1h: number;
  withGps: number;
};

type CategoryDef = (typeof VIOLATION_CATEGORIES)[number];
const CATEGORY_LABEL_BY_ID: Map<string, CategoryDef> = new Map(
  VIOLATION_CATEGORIES.map((c) => [c.id as string, c]),
);

const SEVERITY_BY_CATEGORY: Record<string, number> = Object.fromEntries(
  VIOLATION_CATEGORIES.map((c) => [c.id, c.severity]),
);

export const DEFAULT_FILTERS: AdminFilters = {
  status: "pending",
  category: "",
  marz: "",
  severity: "",
  source: "",
  q: "",
  sort: "newest",
};

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): AdminFilters {
  const pick = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const statusRaw = pick("status") || "pending";
  const status: AdminStatus = (
    ["pending", "flagged", "approved", "rejected", "all"] as const
  ).includes(statusRaw as AdminStatus)
    ? (statusRaw as AdminStatus)
    : "pending";
  const sortRaw = pick("sort") || "newest";
  const sort: AdminSort = (
    ["newest", "oldest", "severity"] as const
  ).includes(sortRaw as AdminSort)
    ? (sortRaw as AdminSort)
    : "newest";
  return {
    status,
    category: pick("category"),
    marz: pick("marz"),
    severity: pick("severity"),
    source: pick("source"),
    q: pick("q").trim().slice(0, 100),
    sort,
  };
}

function buildWhere(filters: AdminFilters): SQL | undefined {
  const clauses: (SQL | undefined)[] = [];
  if (filters.status !== "all") {
    clauses.push(eq(schema.events.moderationStatus, filters.status));
  }
  if (filters.category) {
    clauses.push(eq(schema.events.categoryId, filters.category));
  }
  if (filters.marz) {
    clauses.push(eq(schema.stations.marz, filters.marz));
  }
  if (filters.severity) {
    const sev = Number.parseInt(filters.severity, 10);
    if (!Number.isNaN(sev)) {
      const ids = VIOLATION_CATEGORIES.filter((c) => c.severity === sev).map(
        (c) => c.id,
      );
      if (ids.length > 0) {
        clauses.push(inArray(schema.events.categoryId, ids));
      }
    }
  }
  if (filters.source) {
    clauses.push(eq(schema.events.source, filters.source));
  }
  if (filters.q) {
    const pat = `%${filters.q}%`;
    clauses.push(
      or(
        ilike(schema.events.stationId, pat),
        ilike(schema.events.description, pat),
        ilike(schema.stations.community, pat),
        ilike(schema.stations.address, pat),
        ilike(schema.stations.stationNumber, pat),
      ),
    );
  }
  return clauses.length > 0
    ? and(...(clauses.filter(Boolean) as SQL[]))
    : undefined;
}

export async function loadEvents(
  filters: AdminFilters,
  limit = 100,
): Promise<AdminEventRow[]> {
  const db = getDb();
  const where = buildWhere(filters);

  const orderBy =
    filters.sort === "oldest"
      ? [asc(schema.events.createdAt)]
      : filters.sort === "severity"
        ? [
            // We sort by createdAt as tiebreaker; severity itself is derived
            // client-side from the category id, but we approximate by ordering
            // by category-derived severity through CASE in SQL.
            sql`CASE
              WHEN ${schema.events.categoryId} IN ('ballot_stuffing','carousel_voting','voter_intimidation','ballot_box_tampering','vote_buying') THEN 5
              WHEN ${schema.events.categoryId} IN ('multiple_in_booth','repeated_assistant','observer_obstruction') THEN 4
              WHEN ${schema.events.categoryId} IN ('crowding_50m','ballot_photograph') THEN 3
              WHEN ${schema.events.categoryId} IN ('campaign_on_voting_day') THEN 2
              ELSE 1
            END DESC`,
            desc(schema.events.createdAt),
          ]
        : [desc(schema.events.createdAt)];

  const baseQuery = db
    .select({
      id: schema.events.id,
      stationId: schema.events.stationId,
      categoryId: schema.events.categoryId,
      description: schema.events.description,
      source: schema.events.source,
      locale: schema.events.locale,
      createdAt: schema.events.createdAt,
      reporterFingerprint: schema.events.reporterFingerprint,
      reporterLat: schema.events.reporterLat,
      reporterLng: schema.events.reporterLng,
      reporterAccuracyM: schema.events.reporterAccuracyM,
      reporterGeoCapturedAt: schema.events.reporterGeoCapturedAt,
      moderationStatus: schema.events.moderationStatus,
      moderatorNote: schema.events.moderatorNote,
      moderatedAt: schema.events.moderatedAt,
      marz: schema.stations.marz,
      community: schema.stations.community,
      address: schema.stations.address,
      stationNumber: schema.stations.stationNumber,
    })
    .from(schema.events)
    .leftJoin(
      schema.stations,
      eq(schema.events.stationId, schema.stations.id),
    );

  const rows = where
    ? await baseQuery.where(where).orderBy(...orderBy).limit(limit)
    : await baseQuery.orderBy(...orderBy).limit(limit);

  if (rows.length === 0) return [];

  const fingerprints = Array.from(
    new Set(rows.map((r) => r.reporterFingerprint)),
  );
  const stationIds = Array.from(new Set(rows.map((r) => r.stationId)));

  const [fpCounts, stCounts] = await Promise.all([
    db
      .select({
        fp: schema.events.reporterFingerprint,
        n: sql<number>`count(*)::int`,
      })
      .from(schema.events)
      .where(inArray(schema.events.reporterFingerprint, fingerprints))
      .groupBy(schema.events.reporterFingerprint),
    db
      .select({
        sid: schema.events.stationId,
        n: sql<number>`count(*)::int`,
      })
      .from(schema.events)
      .where(inArray(schema.events.stationId, stationIds))
      .groupBy(schema.events.stationId),
  ]);

  const fpMap = new Map(fpCounts.map((r) => [r.fp, r.n]));
  const stMap = new Map(stCounts.map((r) => [r.sid, r.n]));

  return rows.map((r) => {
    const cat = r.categoryId
      ? CATEGORY_LABEL_BY_ID.get(r.categoryId)
      : undefined;
    return {
      id: r.id,
      stationId: r.stationId,
      categoryId: r.categoryId,
      categoryLabel: cat?.labelAm ?? r.categoryId ?? "—",
      ecArticle: cat?.ecArticle ?? "",
      severity:
        cat?.severity ??
        (r.categoryId ? SEVERITY_BY_CATEGORY[r.categoryId] ?? 0 : 0),
      description: r.description,
      source: r.source,
      locale: r.locale,
      createdAt: r.createdAt.toISOString(),
      marz: r.marz ?? "",
      community: r.community ?? "",
      address: r.address ?? "",
      stationNumber: r.stationNumber ?? "",
      reporterFingerprint: r.reporterFingerprint,
      reporterLat: r.reporterLat,
      reporterLng: r.reporterLng,
      reporterAccuracyM: r.reporterAccuracyM,
      reporterGeoCapturedAt: r.reporterGeoCapturedAt?.toISOString() ?? null,
      moderationStatus: r.moderationStatus,
      moderatorNote: r.moderatorNote,
      moderatedAt: r.moderatedAt?.toISOString() ?? null,
      fingerprintCount: fpMap.get(r.reporterFingerprint) ?? 1,
      stationCount: stMap.get(r.stationId) ?? 1,
    };
  });
}

export async function loadStatusCounts(): Promise<StatusCounts> {
  const db = getDb();
  const rows = await db
    .select({
      status: schema.events.moderationStatus,
      n: sql<number>`count(*)::int`,
    })
    .from(schema.events)
    .groupBy(schema.events.moderationStatus);
  const m = new Map(rows.map((r) => [r.status, r.n]));
  const pending = m.get("pending") ?? 0;
  const flagged = m.get("flagged") ?? 0;
  const approved = m.get("approved") ?? 0;
  const rejected = m.get("rejected") ?? 0;
  return {
    pending,
    flagged,
    approved,
    rejected,
    all: pending + flagged + approved + rejected,
  };
}

export async function loadStats(): Promise<AdminStats> {
  const db = getDb();
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const highSevIds = VIOLATION_CATEGORIES.filter((c) => c.severity >= 4).map(
    (c) => c.id,
  );

  const [todayRow, highSevRow, hourRow, gpsRow] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.events)
      .where(gte(schema.events.createdAt, todayStart)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.events)
      .where(
        and(
          gte(schema.events.createdAt, todayStart),
          inArray(schema.events.categoryId, highSevIds),
        ),
      ),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.events)
      .where(gte(schema.events.createdAt, hourAgo)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.events)
      .where(
        and(
          gte(schema.events.createdAt, todayStart),
          sql`${schema.events.reporterLat} is not null`,
        ),
      ),
  ]);
  return {
    todayTotal: todayRow[0]?.n ?? 0,
    todayHighSeverity: highSevRow[0]?.n ?? 0,
    past1h: hourRow[0]?.n ?? 0,
    withGps: gpsRow[0]?.n ?? 0,
  };
}

export async function loadDistinctMarz(): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .selectDistinct({ marz: schema.stations.marz })
    .from(schema.stations)
    .orderBy(asc(schema.stations.marz));
  return rows.map((r) => r.marz).filter(Boolean);
}
