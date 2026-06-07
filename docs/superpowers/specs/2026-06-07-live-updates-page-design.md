# Live Updates Page (`/live`) — Design Spec

- **Date:** 2026-06-07 (election day)
- **Status:** Approved design → implementation
- **Author:** Ditaket mission (Grisha) + Claude

## Context & Goal

During election day the mission publishes periodic **interim summaries** to
Facebook: a timestamped infographic + long-form text covering key activity
counters (complaints filed to the CEC, issues resolved on-site, phone reports),
the main categories of observed problems, and a few notable cases (with station
numbers). See the 13:00 example in `~/Downloads/Ditaket-FB-Post.png` and
`~/Downloads/Ditaket-Interim-Summary(1).png`.

Goal: a public **`/live`** page on the portal that hosts these same publications
natively — a top **dashboard** of current counters plus a reverse-chronological
**feed** of summaries — fed by the mission coordinator through the existing admin
area. The page should mirror what goes to social media so the portal becomes the
canonical, searchable, accessible home for the mission's election-day reporting.

This is distinct from the existing `/stats` page, which auto-aggregates
**anonymous public violation reports** from the `events` table. `/live` is
**editorial / mission-authored** content. The two cross-link but stay separate.

## Decisions Locked (from brainstorming)

1. **One page, two sections:** live feed (chronological posts) + dashboard
   (current counters).
2. **Data source:** the mission's own observers (not official CEC turnout).
3. **Entry mechanism:** admin enters everything **manually** (coordinator
   collects via phone/Telegram, types it in). No public submission form, no
   automated aggregation.
4. **Turnout metric:** **absolute numbers** (votes cast), with a "across N
   reporting stations" qualifier. No percentage (we do not store registered-voter
   denominators per station).
5. **Infographics are generated on-site** from structured data as native,
   responsive HTML — **not** uploaded PNG images.
6. **Feed posts render as native cards** (matching the infographic visual
   language), not embedded images.
7. **Launch language: Armenian only.** `en`/`ru` fields exist in the model and
   fall back to `am`; translations added later.
8. **Dashboard counters come from the latest published summary** (no separate
   counter table, no double entry).

## Non-Goals (YAGNI for today)

- PNG / OG-image export of summaries for social sharing (**stretch**, easy later —
  `@vercel/blob` already installed; Next 15 `next/og` available).
- `en`/`ru` authored translations.
- Per-station turnout ingestion form; automated turnout aggregation.
- Public submission of any `/live` content.
- WebSockets / push; comments; reactions.
- A turnout time-series chart (11:00/14:00/17:00/20:00). **Stretch** — MVP shows
  turnout as one counter card with an "as of" time.

## Architecture

### Route & rendering

- New segment: `app/[locale]/live/page.tsx` — server component, `revalidate = 30`.
- Queries the DB directly (same pattern as `/stats`), wrapped in `try/catch` so a
  not-yet-pushed schema renders an empty state instead of failing the build.
- A small client `<AutoRefresh intervalMs={30000} />` calls `router.refresh()` on
  an interval. Per `feedback_ssr_client_only_checks`, the interval is set up in
  `useEffect` (never bound to render-time `typeof window` checks).
- Reuses the existing design system: `navy-900` / `orange` / `cream-50`,
  `font-display`, and the `Card` component (accents `navy` / `orange`). These
  already match the infographic palette.

### Data model — one new table

`live_posts` in `lib/db/schema.ts`:

| column        | type        | notes |
|---------------|-------------|-------|
| `id`          | uuid pk     | `defaultRandom()` |
| `kind`        | text        | `'interim_summary'` \| `'flash'` (short one-liner). Default `'interim_summary'`. |
| `pinned`      | boolean     | default `false` |
| `publishedAt` | timestamp   | default `now()`; feed sort key |
| `asOf`        | timestamp   | the time the data reflects (the "ժ. 13:00 դրությամբ" stamp); nullable → falls back to `publishedAt` |
| `counters`    | jsonb       | ordered array, see below |
| `content`     | jsonb       | `{ am: SummaryContent, en?: …, ru?: … }`, see below |
| `createdAt`   | timestamp   | default `now()` |
| `updatedAt`   | timestamp   | default `now()` |

Index: `(pinned, publishedAt desc)` for feed ordering.

```ts
// counters: ordered cards shown on the post AND (for the latest post) the dashboard
type Counter = {
  id: string;            // stable key, e.g. 'complaints' | 'resolved' | 'calls' | 'turnout'
  icon?: string;         // emoji or icon name, e.g. '📄'
  value: number;
  labelAm: string;       // 'ԿԸՀ ներկայացված գրավոր բողոք'
  labelEn?: string;
  labelRu?: string;
  note?: string;         // e.g. 'across 320 reporting stations' (used by turnout)
};

type SummaryContent = {
  badge?: string;        // 'ՄԻՋԱՆԿՅԱԼ ԱՄՓՈՓՈՒՄ'
  title: string;         // 'Ընտրական գործընթացի մշտադիտարկում'
  intro?: string;        // lead paragraph
  highlight?: string;    // the highlighted callout box
  issues?: string[];     // bulleted concerns
  cases?: { stations?: string; text: string }[]; // notable cases (e.g. '33/23, 29/54')
  nextNote?: string;     // 'Հաջորդ հրապարակման մեջ…'
  hashtags?: string[];   // ['Դիտակետ', 'Ընտրություններ2026', …]
};
```

`flash` posts use only `content.am.title` (+ optional `intro`) and no counters —
a quick one-line update between full summaries.

### Public page layout (`/live`)

1. **Header** — page title («Ուղիղ ընթացք» / "Live"), short subtitle, and an
   honesty **disclaimer**: observer-reported, not official CEC results, partial
   coverage (new `Live.disclaimer` i18n key, in the spirit of
   `Common.unverifiedNotice`).
2. **Dashboard band** — counter cards from the **latest** `interim_summary` post:
   each card = icon, large `tabular-nums` value, label, optional note; plus an
   "as of HH:MM" stamp. Empty state when no posts yet.
3. **Feed** — posts ordered `pinned desc, publishedAt desc`. Each
   `interim_summary` renders as a native summary card reproducing the infographic
   structure: badge pill → title → timestamp → intro → highlight box → per-post
   counter mini-grid → issues list → notable cases → next-note → hashtags.
   `flash` posts render as a compact timestamped line.

### Admin (`/admin/live`)

- New page under the existing middleware basic-auth gate (no new auth).
- Lists existing posts with edit / pin / delete.
- Create/edit form built with `react-hook-form` + `zod` (already in deps):
  - meta: `kind`, `publishedAt`, `asOf`, `pinned`;
  - `counters`: repeatable rows (icon, value, `labelAm`, optional `note`);
  - `content.am`: `title`, `badge`, `intro`, `highlight`, `issues[]`
    (repeatable), `cases[]` (repeatable `{stations, text}`), `nextNote`,
    `hashtags[]`.
  - Forgiving validation: required = `content.am.title`; everything else optional.
- API route `app/api/admin/live/route.ts` (POST / PATCH / DELETE), gated by the
  same basic-auth check used in `app/api/admin/moderate/route.ts`, payloads
  validated with a shared zod schema (`lib/live/schema.ts`).

### i18n

- New `Live` namespace in `messages/am.json` (title, subtitle, disclaimer, empty
  state, section labels). Minimal stubs in `en.json` / `ru.json`.
- New `Nav.live` key («Ուղիղ»); add to the nav.
- Authored post content for launch is Armenian only; the renderer reads
  `content[locale] ?? content.am`.

## Error Handling

- Public page: DB query in `try/catch`; on failure or empty DB → friendly empty
  state, never a build/runtime crash (mirrors `/stats`).
- Admin API: validate with zod, return 400 on bad payload, 401 on bad auth,
  500 logged on DB error.
- `AutoRefresh` is a no-op if `router.refresh()` throws (wrapped); never blocks
  render.

## Testing

- **Unit:** zod schema accepts a representative full payload and rejects a
  missing `title`; renderer helpers (e.g. case/issue normalization) are pure and
  unit-tested.
- **Manual (election-day smoke):** create the 13:00 summary in `/admin/live`,
  confirm it appears on `/live`, dashboard counters reflect it, auto-refresh
  picks up a second post within ~30s, pinning reorders the feed.
- **Build safety:** `next build` succeeds with `DATABASE_URL` set but the new
  table absent (empty state path).

## Ops / Migration

- Add `live_posts` to `lib/db/schema.ts`; **the user runs `pnpm db:push`**
  himself against prod env (interactive — per `feedback_interactive_commands`).
- No seed data required. The mission's first real post is the seed.
- Deploy is the normal Vercel flow; `git push` handled manually by the user.

## Stretch (post-launch, ordered)

1. PNG / OG-image export per post (`next/og` route → 1080×1080 + story), to
   replace the manual Canva step.
2. `en` / `ru` authored content.
3. Turnout time-series checkpoint chart (11/14/17/20) as a dedicated counter
   with history.
