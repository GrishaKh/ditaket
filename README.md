# Ditaket — դիտակետ

Public-facing portal for the **2026 Republic of Armenia parliamentary elections** (June 7, 2026).
Anonymous polling-station violation reporting + voter education. Trilingual (Armenian / English / Russian).

## Roadmap

| Phase | When | Scope |
|---|---|---|
| **v1** | now → June 7, 2026 | Portal + anonymous reporting + voter education (no cameras, no AI) |
| **v2** | days before election | Embed CEC live polling-station streams (Electoral Code Art. 8.11.1) |
| **v3** | post-2026 | **Distributed client-side AI observer** — viewer browsers run YOLO via WebGPU; server-side consensus voting |

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Drizzle ORM · Vercel Postgres · Vercel KV · Vercel Blob · Cloudflare Turnstile · `next-intl`

## Brand

Navy `#1e3a64` · Orange `#e8852a` · Cream `#fbf8f3` · Google Sans

## Local development

```bash
pnpm install
cp .env.local.example .env.local   # fill in Vercel + Turnstile keys
pnpm db:push                       # apply Drizzle schema to Postgres
pnpm seed:categories               # seed violation_categories
pnpm import:stations               # import CEC station registry
pnpm dev                           # http://localhost:3000
```

## Project layout

- `app/` — Next.js App Router pages (locale-prefixed under `[locale]/`)
- `components/` — UI components (primitives in `ui/`)
- `lib/` — DB schema, i18n, helpers
- `messages/` — i18n strings (`am.json`, `en.json`, `ru.json`)
- `scripts/` — CEC import, transliteration, seeding
- `Researches/` — background research PDFs (kept for reference)
- `fb_*.html` / `fb_*.png` — original brand creatives

## Implementation plan

See `~/.claude/plans/i-still-dont-have-eventual-hanrahan.md`.

## Anti-spam

Cloudflare Turnstile + Vercel KV rate-limit (3/IP/hr, 10/fingerprint/day) + honeypot + pre-publish moderation queue + ballot-photo classifier. All reports labeled "Unverified — partner organizations review independently."

## License

TBD.
