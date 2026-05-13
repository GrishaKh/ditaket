# Ditaket runbook

## Deploy to Vercel

```bash
# 1. Authenticate (interactive)
vercel login

# 2. Link project to a Vercel team / new project
vercel link

# 3. Provision storage from Vercel Marketplace
#    → Storage tab → Neon Postgres → Create
#    → Storage tab → Upstash Redis → Create
#    These auto-populate DATABASE_URL, UPSTASH_REDIS_REST_URL, etc.

# 4. Set secrets
vercel env add TURNSTILE_SECRET_KEY       # from dash.cloudflare.com/?to=/:account/turnstile
vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY
vercel env add ADMIN_PASSWORD             # random ≥ 32 chars
vercel env add FINGERPRINT_SALT           # random ≥ 32 chars
vercel env add NEXT_PUBLIC_SITE_URL       # https://<your-vercel-domain> or https://ditaket.am

# 5. Apply DB schema
vercel env pull .env.production.local
pnpm db:push   # creates the four tables on Neon

# 6. Seed categories + stations
pnpm seed:categories
pnpm import:stations data/stations.import.json   # see scripts/import-stations.ts header

# 7. Deploy
vercel deploy --prod
```

## Verify after deploy

```bash
HOST=https://ditaket.vercel.app   # or your custom domain

# Health
curl $HOST/api/health | jq

# Status page
curl -s -o /dev/null -w "%{http_code}\n" $HOST/am/status   # → 200

# Locales
for L in am en ru; do curl -s -o /dev/null -w "/$L %{http_code}\n" $HOST/$L; done

# Sample station + report submission (dev token will fail in prod with Turnstile)
curl -s $HOST/api/events?limit=3 | jq
```

## Election day on-call (June 7, 2026)

Times in **AMT (UTC+4)**.

| Time | Action |
|---|---|
| 04:00 | Bring up war-room channel; verify `/api/health` green |
| 06:00 | Pre-poll readiness sweep: dev fixture cleared, mod queue empty, partner-org export OK |
| 07:30 | Soft cache warm-up: hit each marz page once via load-test script |
| 08:00 | **Polls open** — start the moderation rota; mod team rotates every 2h |
| 09:00+ | Watch `/status` page; respond to volume spikes |
| 12:00 | Spot-check: pull last hour's `/api/events?since=...` and cross-reference with one partner org |
| 14:00 | Mid-day press post (if applicable): aggregate counts from `/stats` |
| 19:30 | Final 30-min surge expected; ensure no rate-limit storms |
| 20:00 | **Polls close** — stop accepting new reports automatically? (configurable) |
| 20:00–23:00 | Recount-period monitoring; expect a second surge as protocols are reviewed |
| 23:00+ | Cool-down. Snapshot stats. Post end-of-day summary. |

## Things that page you

- `/api/health` returns `database.reachable: false`
- 5xx rate on Vercel Analytics > 1% over 5 min
- Mod queue grows > 500 entries with < 1 approve/min throughput
- Cloudflare Turnstile reports > 30% failure rate (likely an attack)
- Upstash Redis hits the free tier ceiling (upgrade plan, do not let rate-limit silently fail open)

## Cool-down: post-election

1. Snapshot Postgres before any cleanup (`pg_dump`).
2. Aggregate report (counts by marz × category × hour) — publish.
3. Delete reporter fingerprints + IPs older than 30 days per privacy policy.
4. Lock new submissions after a defined cutoff (default 72h post-polls-close).
5. Open-source the dataset (anonymised) for civil-society research.

## Mirror domain plan (pre-election)

- Register one fallback domain (`.eu` or `.org`).
- Point both at the same Vercel deployment.
- Pre-announce both on the about page so journalists know the canonical pair.
- If primary is DDoSed past Cloudflare's tolerance, post-incident announce the mirror via partner orgs / social.
