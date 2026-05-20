import { NextRequest } from "next/server";
import { z } from "zod";
import { and, eq, gt, sql } from "drizzle-orm";
import { getDb, hasDatabase, schema } from "@/lib/db/client";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { fingerprintFromRequest, clientIp } from "@/lib/fingerprint";
import { VIOLATION_CATEGORIES } from "@/lib/violations/categories";

const VALID_CATEGORY_IDS: Set<string> = new Set(
  VIOLATION_CATEGORIES.map((c) => c.id),
);

// Bumped when the consent UX or storage semantics change. Persisted with the
// row so we can later distinguish reports captured under different policies.
const GEO_CONSENT_VERSION = "v1.2026-05";

const ReportSchema = z.object({
  stationId: z.string().min(3).max(50),
  categoryId: z
    .string()
    .min(1)
    .max(100)
    .refine((id) => VALID_CATEGORY_IDS.has(id), {
      message: "Unknown category",
    }),
  description: z.string().max(2000).optional().default(""),
  evidenceUrl: z.string().url().nullish(),
  locale: z.enum(["am", "en", "ru"]).default("am"),
  turnstileToken: z.string().min(1, "Captcha token required"),
  // Optional reporter location, captured by the browser at submit time only
  // if the user consents. Server stores raw values; no auto-verification.
  reporterLat: z.number().gte(-90).lte(90).optional(),
  reporterLng: z.number().gte(-180).lte(180).optional(),
  reporterAccuracyM: z.number().positive().max(100000).optional(),
  // Honeypot: hidden in the form. If a bot fills it, the request validates
  // but the handler silently drops it (see below).
  website: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = ReportSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Honeypot tripped → silently accept-and-drop to confuse bots
  if (data.website && data.website.length > 0) {
    return Response.json({ ok: true, queued: false }, { status: 200 });
  }

  // Verify Turnstile (no-op in dev without secret)
  const turnstileOk = await verifyTurnstile(data.turnstileToken, req);
  if (!turnstileOk) {
    return Response.json({ error: "turnstile_failed" }, { status: 403 });
  }

  const ip = clientIp(req);
  const fingerprint = fingerprintFromRequest(req);

  const rl = await checkRateLimit(ip, fingerprint);
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", reason: rl.reason },
      { status: 429 },
    );
  }

  // Persist. If no DB configured, surface a clean 503 (the form will still
  // be testable end-to-end up to this point in dev).
  if (!hasDatabase) {
    console.warn("[ditaket] Report validated but no DB to write to (dev).");
    return Response.json(
      { ok: true, queued: false, note: "dev-no-db" },
      { status: 202 },
    );
  }

  const db = getDb();

  // Dedup: identical (station, category, fingerprint) within 30 min → silent merge
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const existing = await db
    .select({ id: schema.events.id })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.stationId, data.stationId),
        eq(schema.events.categoryId, data.categoryId),
        eq(schema.events.reporterFingerprint, fingerprint),
        gt(schema.events.createdAt, thirtyMinAgo),
      ),
    )
    .limit(1);
  if (existing.length > 0) {
    return Response.json(
      { ok: true, queued: true, deduped: true, id: existing[0]!.id },
      { status: 200 },
    );
  }

  // Treat reporter coords as a single triple — either all three present (full
  // snapshot) or none. Partial data is suspicious; drop it on the floor.
  const hasGeo =
    data.reporterLat !== undefined &&
    data.reporterLng !== undefined &&
    data.reporterAccuracyM !== undefined;

  // Insert as pending
  const [row] = await db
    .insert(schema.events)
    .values({
      stationId: data.stationId,
      source: "user_report",
      categoryId: data.categoryId,
      description: data.description,
      evidenceUrl: data.evidenceUrl ?? null,
      moderationStatus: "pending",
      reporterFingerprint: fingerprint,
      locale: data.locale,
      reporterLat: hasGeo ? data.reporterLat : null,
      reporterLng: hasGeo ? data.reporterLng : null,
      reporterAccuracyM: hasGeo ? data.reporterAccuracyM : null,
      reporterGeoCapturedAt: hasGeo ? new Date() : null,
      reporterGeoConsentVersion: hasGeo ? GEO_CONSENT_VERSION : null,
    })
    .returning({ id: schema.events.id });

  return Response.json(
    { ok: true, queued: true, deduped: false, id: row?.id },
    { status: 201 },
  );
}

// Block other methods cleanly
export async function GET() {
  return Response.json({ error: "method_not_allowed" }, { status: 405 });
}
