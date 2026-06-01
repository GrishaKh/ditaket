#!/usr/bin/env node
/**
 * Geocode the CEC polling-station registry.
 *
 *   Input : data/stations.dev.json (or whatever --input points at)
 *   Output: data/stations.geocoded.json — same rows plus { lat, lng,
 *           accuracy, source, confidence, query, geocodedAt }
 *
 * Providers:
 *   - nominatim (default): OpenStreetMap, free, 1 req/sec hard limit per their
 *     Acceptable Use Policy. ~33 min for 2,005 rows. Coverage in Armenia is
 *     uneven — Yerevan is good, rural villages are spotty.
 *   - google: Google Maps Geocoding API. Needs GOOGLE_MAPS_API_KEY. ~5 min
 *     for 2,005 rows. About $10 total at $5/1000 requests.
 *
 * Usage:
 *   node scripts/geocode-stations.mjs --provider=nominatim --limit=20
 *   node scripts/geocode-stations.mjs --provider=google
 *   node scripts/geocode-stations.mjs --resume          # skip already-done rows
 *
 * The script is RESUMABLE: re-running picks up where it left off, so a
 * crash mid-batch is cheap to recover from. Output is rewritten atomically
 * every FLUSH_EVERY rows.
 */
import { readFile, writeFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// ── CLI ─────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=?(.*)$/);
    return m ? [m[1], m[2] || "true"] : [a, "true"];
  }),
);
const PROVIDER = args.provider || "nominatim";
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const INPUT = resolve(process.cwd(), args.input || "data/stations.dev.json");
const OUTPUT = resolve(
  process.cwd(),
  args.output || "data/stations.geocoded.json",
);
const RESUME = args.resume === "true" || existsSync(OUTPUT);
const FLUSH_EVERY = 25;

// ── Helpers ─────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// CEC writes locality names with an admin-level suffix:
//   "Մասիս քաղաք"   ("Masis city")
//   "Դիտակ գյուղ"    ("Ditak village")
//   "Բերդավան ավան" ("Berdavan town")
// Nominatim matches the bare place name, not the literal compound, so we strip.
const LOCALITY_SUFFIX_RE = /\s+(քաղաք|գյուղ|ավան|համայնք)$/u;

function localityOf(s) {
  const raw = s.settlement && s.settlement.trim() ? s.settlement : s.community;
  return raw.replace(LOCALITY_SUFFIX_RE, "").trim();
}

function fullAddressQuery(s) {
  // {address}, {settlement || community}, {marz}, Armenia
  return [s.address, localityOf(s), s.marz, "Armenia"]
    .filter(Boolean)
    .join(", ");
}

function localityQuery(s) {
  // {settlement || community}, {marz}, Armenia
  return [localityOf(s), s.marz, "Armenia"].filter(Boolean).join(", ");
}

async function writeAtomic(path, data) {
  const tmp = `${path}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2));
  await rename(tmp, path);
}

// ── Providers ───────────────────────────────────────────────────────────
/**
 * Nominatim — OSM. 1 req/sec, identify with a real User-Agent per policy.
 * Returns { lat, lng, accuracy, confidence } or null.
 *
 *   "confidence" is a rough 0..1 we derive from OSM's "importance" + "type".
 *   "accuracy" is qualitative: 'building' | 'street' | 'locality'.
 */
async function geocodeNominatim(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("countrycodes", "am");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "hy,en");

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "ditaket-geocoder/0.1 (contact: grisha.khachatrian@gmail.com)",
    },
  });
  if (!res.ok) {
    return { error: `nominatim_http_${res.status}` };
  }
  const rows = await res.json();
  if (!rows.length) return null;
  const hit = rows[0];
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  // Map OSM "addresstype" / "type" to our coarse accuracy bucket
  const t = hit.addresstype || hit.type || "";
  const accuracy =
    t === "building" || t === "house" || t === "amenity"
      ? "building"
      : t === "road" || t === "street"
        ? "street"
        : "locality";

  return {
    lat,
    lng,
    accuracy,
    confidence: Number(hit.importance) || 0.3,
    raw: { osm_type: hit.osm_type, osm_id: hit.osm_id, type: hit.type },
  };
}

/**
 * Google Maps Geocoding API.
 * Returns { lat, lng, accuracy, confidence } or null.
 */
async function geocodeGoogle(query) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY not set");

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("region", "am");
  url.searchParams.set("language", "hy");
  url.searchParams.set("key", key);

  const res = await fetch(url);
  if (!res.ok) return { error: `google_http_${res.status}` };
  const body = await res.json();
  if (body.status === "ZERO_RESULTS") return null;
  if (body.status !== "OK") return { error: `google_${body.status}` };
  const hit = body.results[0];
  if (!hit) return null;

  const { lat, lng } = hit.geometry.location;
  // Google's location_type: ROOFTOP > RANGE_INTERPOLATED > GEOMETRIC_CENTER > APPROXIMATE
  const lt = hit.geometry.location_type;
  const accuracy =
    lt === "ROOFTOP"
      ? "building"
      : lt === "RANGE_INTERPOLATED"
        ? "street"
        : lt === "GEOMETRIC_CENTER"
          ? "street"
          : "locality";
  const confidence =
    lt === "ROOFTOP"
      ? 0.95
      : lt === "RANGE_INTERPOLATED"
        ? 0.8
        : lt === "GEOMETRIC_CENTER"
          ? 0.6
          : 0.3;

  return {
    lat,
    lng,
    accuracy,
    confidence,
    raw: { place_id: hit.place_id, location_type: lt, types: hit.types },
  };
}

const PROVIDERS = {
  nominatim: { fn: geocodeNominatim, minIntervalMs: 1100 },
  google: { fn: geocodeGoogle, minIntervalMs: 50 },
};

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  const provider = PROVIDERS[PROVIDER];
  if (!provider) {
    console.error(
      `unknown provider: ${PROVIDER}. expected: nominatim | google`,
    );
    process.exit(2);
  }

  const raw = await readFile(INPUT, "utf-8");
  const stations = JSON.parse(raw);
  console.log(`[geocode] loaded ${stations.length} stations from ${INPUT}`);

  let existing = [];
  if (RESUME && existsSync(OUTPUT)) {
    existing = JSON.parse(await readFile(OUTPUT, "utf-8"));
    console.log(
      `[geocode] resuming: ${existing.length} rows already in ${OUTPUT}`,
    );
  }
  const doneByCode = new Map(existing.map((r) => [r.cecCode, r]));

  const out = [...existing];
  // Locality cache: many stations share a village/city. Same key → reuse coords
  // so we don't re-query Nominatim hundreds of times for "Գյումրի, Շիրակ".
  const localityCache = new Map();
  for (const r of existing) {
    if (r.accuracy === "locality" && r.lat != null) {
      localityCache.set(localityQuery(r), {
        lat: r.lat,
        lng: r.lng,
        confidence: r.confidence,
      });
    }
  }

  let processed = 0;
  let buildingHits = 0;
  let localityHits = 0;
  let localityCacheHits = 0;
  let failed = 0;
  let skipped = 0;

  /**
   * Throttled provider call. Sleeps to respect minIntervalMs *after* the call
   * returns, so we never exceed the rate limit no matter how fast the response.
   */
  async function call(query) {
    const t0 = Date.now();
    let r = null;
    try {
      r = await provider.fn(query);
    } catch (e) {
      r = { error: String(e?.message || e) };
    }
    const elapsed = Date.now() - t0;
    if (elapsed < provider.minIntervalMs) {
      await sleep(provider.minIntervalMs - elapsed);
    }
    return r;
  }

  for (const s of stations) {
    if (processed >= LIMIT) break;
    if (doneByCode.has(s.cecCode)) {
      skipped += 1;
      continue;
    }
    processed += 1;

    // Tier 1: full address (building / street precision when it works)
    const q1 = fullAddressQuery(s);
    let result = await call(q1);
    let usedQuery = q1;
    let tier = "address";

    // Tier 2: locality fallback (settlement / community center)
    if (!result?.lat) {
      const q2 = localityQuery(s);
      const cached = localityCache.get(q2);
      if (cached) {
        result = {
          ...cached,
          accuracy: "locality",
        };
        usedQuery = q2;
        tier = "locality_cached";
        localityCacheHits += 1;
      } else {
        result = await call(q2);
        if (result?.lat) {
          // force locality bucket even if Nominatim says 'town'/'village'
          result.accuracy = "locality";
          localityCache.set(q2, {
            lat: result.lat,
            lng: result.lng,
            confidence: result.confidence,
          });
        }
        usedQuery = q2;
        tier = "locality";
      }
    }

    const row = {
      ...s,
      query: usedQuery,
      tier,
      lat: result?.lat ?? null,
      lng: result?.lng ?? null,
      accuracy: result?.accuracy ?? null,
      confidence: result?.confidence ?? null,
      source: result?.lat ? PROVIDER : null,
      error: result?.lat ? null : result?.error || "no_result",
      geocodedAt: new Date().toISOString(),
    };
    out.push(row);
    doneByCode.set(s.cecCode, row);

    if (result?.lat) {
      if (row.accuracy === "locality") localityHits += 1;
      else buildingHits += 1;
    } else {
      failed += 1;
    }

    const tag = result?.lat
      ? `✓ ${tier.padEnd(16)} ${(row.accuracy || "").padEnd(8)} c=${row.confidence?.toFixed(2)}`
      : `✗ ${row.error}`;
    console.log(
      `[${String(processed).padStart(4)}] ${s.cecCode.padEnd(8)} ${tag}  ${usedQuery.slice(0, 70)}`,
    );

    if (processed % FLUSH_EVERY === 0) {
      await writeAtomic(OUTPUT, out);
    }
  }

  await writeAtomic(OUTPUT, out);
  console.log(
    `\n[geocode] done. processed=${processed} building/street=${buildingHits} locality=${localityHits} locality_cached=${localityCacheHits} failed=${failed} skipped(resume)=${skipped}`,
  );
  console.log(`[geocode] wrote ${out.length} rows to ${OUTPUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
