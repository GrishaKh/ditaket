#!/usr/bin/env node
/**
 * Lightweight load test for /api/report.
 * Hits the local dev server (or any --target) with N concurrent virtual users
 * for D seconds, randomly sampling stations + categories. Mirrors what k6
 * would do but uses only the Node runtime — no extra binary.
 *
 *   node scripts/load-test.mjs --target=http://localhost:3000 --vus=20 --duration=10
 *
 * To exercise the abuse-drill path, raise --vus to flood the rate-limiter.
 */
import { performance } from 'node:perf_hooks';
import { readFile } from 'node:fs/promises';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  }),
);

const TARGET = args.target ?? 'http://localhost:3000';
const VUS = Number(args.vus ?? 10);
const DURATION_S = Number(args.duration ?? 10);

const stations = JSON.parse(
  await readFile('data/stations.dev.json', 'utf-8'),
).map((s) => {
  const [a, b] = s.cecCode.split('/');
  return `${a.padStart(2, '0')}-${b.padStart(3, '0')}`;
});

const CATEGORIES = [
  'multiple_in_booth',
  'crowding_50m',
  'voter_intimidation',
  'ballot_stuffing',
  'observer_obstruction',
  'campaign_on_voting_day',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const stats = {
  sent: 0,
  ok: 0,
  rateLimited: 0,
  validation: 0,
  forbidden: 0,
  other: 0,
  errors: 0,
  latencies: [],
};

async function vu(stopAt) {
  while (performance.now() < stopAt) {
    const body = {
      stationId: pick(stations),
      categoryId: pick(CATEGORIES),
      description: `loadtest-${Math.random().toString(36).slice(2, 8)}`,
      locale: 'am',
      turnstileToken: 'dev-bypass',
    };
    const t0 = performance.now();
    try {
      const res = await fetch(`${TARGET}/api/report`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      stats.sent += 1;
      stats.latencies.push(performance.now() - t0);
      if (res.status === 200 || res.status === 201 || res.status === 202) stats.ok += 1;
      else if (res.status === 429) stats.rateLimited += 1;
      else if (res.status === 400) stats.validation += 1;
      else if (res.status === 403) stats.forbidden += 1;
      else stats.other += 1;
    } catch {
      stats.errors += 1;
    }
  }
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

async function main() {
  const stopAt = performance.now() + DURATION_S * 1000;
  console.log(
    `→ target=${TARGET} vus=${VUS} duration=${DURATION_S}s (${stations.length} stations × ${CATEGORIES.length} categories)`,
  );
  const t0 = performance.now();
  await Promise.all(Array.from({ length: VUS }, () => vu(stopAt)));
  const elapsed = (performance.now() - t0) / 1000;

  console.log(`\n--- results (${elapsed.toFixed(2)}s) ---`);
  console.log(`sent           ${stats.sent}`);
  console.log(`ok (2xx)       ${stats.ok}`);
  console.log(`rate-limited   ${stats.rateLimited}`);
  console.log(`validation     ${stats.validation}`);
  console.log(`forbidden      ${stats.forbidden}`);
  console.log(`other status   ${stats.other}`);
  console.log(`errors         ${stats.errors}`);
  console.log(`throughput     ${(stats.sent / elapsed).toFixed(1)} req/s`);
  console.log(`latency p50    ${percentile(stats.latencies, 50).toFixed(0)} ms`);
  console.log(`latency p95    ${percentile(stats.latencies, 95).toFixed(0)} ms`);
  console.log(`latency p99    ${percentile(stats.latencies, 99).toFixed(0)} ms`);
}

main();
