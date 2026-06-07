# Live Updates Page (`/live`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an election-day `/live` page that shows a counter dashboard plus a feed of natively-rendered interim summaries, all entered by the mission coordinator through the admin area.

**Architecture:** One new `live_posts` table (jsonb `content` + `counters`). A server component at `app/[locale]/live/page.tsx` (ISR `revalidate=30` + client auto-refresh) reads posts directly from the DB and renders presentational components. Admin CRUD lives at `/admin/live` (behind existing basic-auth) backed by `app/api/admin/live/route.ts`.

**Tech Stack:** Next.js 15 App Router, next-intl, Drizzle ORM (Neon), zod, Tailwind (existing navy/orange/cream design system). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-06-07-live-updates-page-design.md`

---

## Conventions for this plan

- **Verification:** the repo has **no test runner** (confirmed: no vitest/jest). Per the spec's election-day speed priority, pure logic (zod schema, format helpers) is verified with a runnable assertion script via `tsx` (the repo already uses `tsx` for `scripts/*`); UI/DB code is verified with `pnpm exec tsc --noEmit` and a documented browser smoke. This is a deliberate, spec-sanctioned adaptation of TDD.
- **Admin auth:** admin pages are gated by basic-auth in `middleware.ts`; the browser auto-sends the `Authorization` header to same-origin `/api/admin/*` fetches (this is exactly how `app/api/admin/moderate/route.ts` already works). The API route re-checks the header server-side anyway.
- **Quotes/format:** new app/component/lib files use single quotes (dominant in `app/`); `lib/db/schema.ts` keeps its existing double quotes. Run `pnpm format` if churn appears — not required per step.
- **db:push is the user's job:** after Task 1, the schema change must be applied with `pnpm db:push` against the prod env. This is interactive — **do not run it**; flag it to the user (see Task 1, Step 5).

---

## File Structure

**Create:**
- `lib/live/types.ts` — pure TS types (`LiveCounter`, `SummaryContent`, `LivePostContent`, `LivePostKind`).
- `lib/live/schema.ts` — zod schemas + inferred input/patch types.
- `lib/live/format.ts` — pure render helpers (`pickContent`, `formatTime`, `formatCount`, `counterLabel`).
- `lib/live/queries.ts` — `loadLivePosts()`, `latestCounters()`.
- `scripts/check-live.ts` — runnable assertion script for schema + format.
- `components/live/CounterCards.tsx` — counter grid (dashboard + compact variants).
- `components/live/SummaryCard.tsx` — full interim-summary card.
- `components/live/FlashCard.tsx` — compact one-line update.
- `components/live/AutoRefresh.tsx` — client interval `router.refresh()`.
- `app/[locale]/live/page.tsx` — public page.
- `app/api/admin/live/route.ts` — admin CRUD API.
- `app/admin/live/page.tsx` — admin server page (list).
- `app/admin/live/LiveEditor.tsx` — admin client editor.

**Modify:**
- `lib/db/schema.ts` — add `livePosts` table + `LivePost`/`NewLivePost` types.
- `messages/am.json` — add `Nav.live` + full `Live` namespace.
- `messages/en.json`, `messages/ru.json` — add `Nav.live` + minimal `Live` stubs.
- `components/Header.tsx` — add `/live` nav link.

---

## Task 1: `live_posts` table

**Files:**
- Modify: `lib/db/schema.ts`
- Create: `lib/live/types.ts`

- [ ] **Step 1: Create the pure types module**

Create `lib/live/types.ts`:

```ts
export type LivePostKind = 'interim_summary' | 'flash';

export type LiveCounter = {
  id: string; // stable key: 'complaints' | 'resolved' | 'calls' | 'turnout' | …
  icon?: string; // emoji, e.g. '📄'
  value: number;
  labelAm: string;
  labelEn?: string;
  labelRu?: string;
  note?: string; // e.g. 'across 320 reporting stations'
};

export type SummaryContent = {
  badge?: string; // 'ՄԻՋԱՆԿՅԱԼ ԱՄՓՈՓՈՒՄ'
  title: string;
  intro?: string;
  highlight?: string;
  issues?: string[];
  cases?: { stations?: string; text: string }[];
  nextNote?: string;
  hashtags?: string[];
};

export type LivePostContent = {
  am?: SummaryContent;
  en?: SummaryContent;
  ru?: SummaryContent;
};
```

- [ ] **Step 2: Add the table to the Drizzle schema**

In `lib/db/schema.ts`, add `jsonb` and `sql` imports and the table. The import line currently reads:

```ts
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
} from "drizzle-orm/pg-core";
```

Change it to add `jsonb`:

```ts
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
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { LiveCounter, LivePostContent } from "@/lib/live/types";
```

Then append, after the `statsSnapshots` table and before the trailing `export type` block:

```ts
/**
 * Editorial election-day updates shown at /live. Authored by the mission
 * coordinator through /admin/live — NOT public submissions. Dashboard counters
 * are derived from the most recent interim_summary's `counters`.
 */
export const livePosts = pgTable(
  "live_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull().default("interim_summary"), // 'interim_summary' | 'flash'
    pinned: boolean("pinned").notNull().default(false),
    publishedAt: timestamp("published_at").notNull().defaultNow(),
    asOf: timestamp("as_of"), // the "ժ. 13:00 դրությամբ" stamp; NULL → publishedAt
    counters: jsonb("counters")
      .$type<LiveCounter[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    content: jsonb("content")
      .$type<LivePostContent>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    feedIdx: index("live_posts_feed_idx").on(t.pinned, t.publishedAt),
  }),
);
```

Add to the trailing type-export block:

```ts
export type LivePost = typeof livePosts.$inferSelect;
export type NewLivePost = typeof livePosts.$inferInsert;
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: PASS (no errors).

- [ ] **Step 4: Commit**

```bash
git add lib/live/types.ts lib/db/schema.ts
git commit -m "feat(live): add live_posts table + content types"
```

- [ ] **Step 5: Flag db:push to the user (do not run it)**

Tell the user: "The `live_posts` table is defined. Run `pnpm db:push` against the prod env yourself when ready — it's interactive, so I won't run it." Continue with remaining tasks regardless (later tasks don't require the table to exist; queries are guarded).

---

## Task 2: zod schema + assertion harness

**Files:**
- Create: `lib/live/schema.ts`
- Create: `scripts/check-live.ts`

- [ ] **Step 1: Write the failing assertion script**

Create `scripts/check-live.ts` (uses relative imports so `tsx` resolves them without path aliases; `import type` lines elsewhere are erased at runtime):

```ts
import assert from 'node:assert/strict';
import { livePostInputSchema, livePostPatchSchema } from '../lib/live/schema';

// 1. Minimal valid input (am title only) passes and applies defaults.
const ok = livePostInputSchema.safeParse({
  content: { am: { title: 'Միջանկյալ ամփոփում' } },
});
assert.ok(ok.success, 'minimal input should pass');
assert.equal(ok.data.kind, 'interim_summary', 'kind defaults');
assert.equal(ok.data.pinned, false, 'pinned defaults');
assert.deepEqual(ok.data.counters, [], 'counters default to []');

// 2. Missing am title fails.
const bad = livePostInputSchema.safeParse({ content: { am: {} } });
assert.ok(!bad.success, 'missing title should fail');

// 3. Full payload with counters + cases passes.
const full = livePostInputSchema.safeParse({
  kind: 'interim_summary',
  pinned: true,
  publishedAt: '2026-06-07T13:00:00Z',
  asOf: '2026-06-07T13:00:00Z',
  counters: [
    { id: 'complaints', icon: '📄', value: 6, labelAm: 'ԿԸՀ ներկայացված գրավոր բողոք' },
    { id: 'turnout', icon: '📊', value: 12450, labelAm: 'Մասնակցություն', note: '320 տեղամասում' },
  ],
  content: {
    am: {
      badge: 'ՄԻՋԱՆԿՅԱԼ ԱՄՓՈՓՈՒՄ',
      title: 'Ընտրական գործընթացի մշտադիտարկում',
      intro: 'Առաքելությունը շարունակում է…',
      highlight: 'Արձանագրված ահազանգեր…',
      issues: ['Քվեարկության գաղտնիություն…'],
      cases: [{ stations: '33/23, 29/54', text: 'Վստահված անձինք ուղղորդել են…' }],
      nextNote: 'Հաջորդ հրապարակման մեջ…',
      hashtags: ['Դիտակետ', 'Ընտրություններ2026'],
    },
  },
});
assert.ok(full.success, 'full payload should pass');

// 4. Patch requires a uuid id.
assert.ok(!livePostPatchSchema.safeParse({ pinned: true }).success, 'patch needs id');
assert.ok(
  livePostPatchSchema.safeParse({ id: '00000000-0000-0000-0000-000000000000', pinned: true })
    .success,
  'patch with id passes',
);

console.log('check-live: schema OK');
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec tsx scripts/check-live.ts`
Expected: FAIL — cannot find module `../lib/live/schema`.

- [ ] **Step 3: Implement the zod schema**

Create `lib/live/schema.ts`:

```ts
import { z } from 'zod';

export const counterSchema = z.object({
  id: z.string().min(1).max(40),
  icon: z.string().max(8).optional(),
  value: z.number().int().nonnegative(),
  labelAm: z.string().min(1).max(120),
  labelEn: z.string().max(120).optional(),
  labelRu: z.string().max(120).optional(),
  note: z.string().max(160).optional(),
});

export const summaryContentSchema = z.object({
  badge: z.string().max(80).optional(),
  title: z.string().min(1).max(200),
  intro: z.string().max(4000).optional(),
  highlight: z.string().max(2000).optional(),
  issues: z.array(z.string().min(1).max(600)).max(30).optional(),
  cases: z
    .array(
      z.object({
        stations: z.string().max(120).optional(),
        text: z.string().min(1).max(800),
      }),
    )
    .max(30)
    .optional(),
  nextNote: z.string().max(2000).optional(),
  hashtags: z.array(z.string().min(1).max(60)).max(20).optional(),
});

export const livePostContentSchema = z.object({
  am: summaryContentSchema,
  en: summaryContentSchema.optional(),
  ru: summaryContentSchema.optional(),
});

export const livePostInputSchema = z.object({
  kind: z.enum(['interim_summary', 'flash']).default('interim_summary'),
  pinned: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
  asOf: z.coerce.date().nullish(),
  counters: z.array(counterSchema).max(12).default([]),
  content: livePostContentSchema,
});

export const livePostPatchSchema = livePostInputSchema.partial().extend({
  id: z.string().uuid(),
});

export type LivePostInput = z.infer<typeof livePostInputSchema>;
export type LivePostPatch = z.infer<typeof livePostPatchSchema>;
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec tsx scripts/check-live.ts`
Expected: PASS — prints `check-live: schema OK`.

- [ ] **Step 5: Commit**

```bash
git add lib/live/schema.ts scripts/check-live.ts
git commit -m "feat(live): zod schema for live posts + assertion harness"
```

---

## Task 3: format helpers

**Files:**
- Create: `lib/live/format.ts`
- Modify: `scripts/check-live.ts`

- [ ] **Step 1: Extend the assertion script (failing)**

Append to `scripts/check-live.ts`, before the final `console.log`:

```ts
import { pickContent, counterLabel, formatCount } from '../lib/live/format';

// pickContent falls back to am when the requested locale is missing.
const content = { am: { title: 'Հայ' }, en: { title: 'EN' } };
assert.equal(pickContent(content, 'en').title, 'EN', 'picks en');
assert.equal(pickContent(content, 'ru').title, 'Հայ', 'ru falls back to am');

// counterLabel falls back to am when the locale label is absent.
const c = { id: 'x', value: 1, labelAm: 'Հայ', labelEn: 'EN' };
assert.equal(counterLabel(c, 'en'), 'EN', 'counter en');
assert.equal(counterLabel(c, 'ru'), 'Հայ', 'counter ru falls back');

// formatCount returns a non-empty string for a number.
assert.ok(formatCount(12450, 'am').length > 0, 'formatCount works');
```

Note: ESM hoists `import` to the top, so placement is cosmetic — the new imports run before the new asserts regardless.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec tsx scripts/check-live.ts`
Expected: FAIL — cannot find module `../lib/live/format`.

- [ ] **Step 3: Implement the helpers**

Create `lib/live/format.ts`:

```ts
import type { Locale } from '@/lib/i18n/routing';
import type { LiveCounter, LivePostContent, SummaryContent } from './types';

const EMPTY: SummaryContent = { title: '' };

export function pickContent(
  content: LivePostContent | null | undefined,
  locale: Locale,
): SummaryContent {
  if (!content) return EMPTY;
  return content[locale] ?? content.am ?? EMPTY;
}

export function counterLabel(c: LiveCounter, locale: Locale): string {
  if (locale === 'en') return c.labelEn ?? c.labelAm;
  if (locale === 'ru') return c.labelRu ?? c.labelAm;
  return c.labelAm;
}

function intlLocale(locale: Locale): string {
  return locale === 'am' ? 'hy-AM' : locale;
}

export function formatTime(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatCount(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(n);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm exec tsx scripts/check-live.ts`
Expected: PASS — prints `check-live: schema OK`.

- [ ] **Step 5: Commit**

```bash
git add lib/live/format.ts scripts/check-live.ts
git commit -m "feat(live): locale-aware format helpers"
```

---

## Task 4: public query helpers

**Files:**
- Create: `lib/live/queries.ts`

- [ ] **Step 1: Implement the queries**

Create `lib/live/queries.ts`:

```ts
import { desc } from 'drizzle-orm';
import { getDb, hasDatabase, schema } from '@/lib/db/client';
import type { LivePost } from '@/lib/db/schema';
import type { LiveCounter } from './types';

/**
 * Feed order: pinned first, then newest. Returns [] (never throws) so the page
 * renders an empty state when the DB is absent or the schema isn't pushed yet.
 */
export async function loadLivePosts(): Promise<LivePost[]> {
  if (!hasDatabase) return [];
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.livePosts)
      .orderBy(desc(schema.livePosts.pinned), desc(schema.livePosts.publishedAt));
  } catch (e) {
    console.warn('[ditaket] live: load failed (schema not pushed?)', e);
    return [];
  }
}

/**
 * Dashboard counters come from the most recent interim_summary that actually
 * has counters — independent of pinning.
 */
export function latestCounters(
  posts: LivePost[],
): { counters: LiveCounter[]; asOf: Date } | null {
  const summaries = posts
    .filter(
      (p) =>
        p.kind === 'interim_summary' &&
        Array.isArray(p.counters) &&
        p.counters.length > 0,
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  const latest = summaries[0];
  if (!latest) return null;
  return { counters: latest.counters, asOf: latest.asOf ?? latest.publishedAt };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/live/queries.ts
git commit -m "feat(live): public query helpers (feed + dashboard counters)"
```

---

## Task 5: i18n strings + nav link

**Files:**
- Modify: `messages/am.json`, `messages/en.json`, `messages/ru.json`
- Modify: `components/Header.tsx`

- [ ] **Step 1: Add Armenian strings**

In `messages/am.json`, add a `live` key to the `Nav` object:

```json
    "live": "Ուղիղ"
```

And add a new top-level `Live` namespace (place it after `Nav`):

```json
  "Live": {
    "title": "Ուղիղ ընթացք",
    "subtitle": "Ընտրական գործընթացի մշտադիտարկում՝ իրական ժամանակում",
    "disclaimer": "Դիտորդական տվյալներ՝ հիմնված մեր դիտորդների հաղորդումների վրա։ Սրանք պաշտոնական ԿԸՀ արդյունքներ չեն և կարող են ընդգրկել տեղամասերի միայն մի մասը։",
    "dashboardTitle": "Ընթացիկ ցուցանիշներ",
    "feedTitle": "Հրապարակումներ",
    "issuesTitle": "Հիմնական խնդիրներ և մտահոգություններ",
    "casesTitle": "Առանձին դեպքեր",
    "stationsLabel": "Տեղամաս(եր)",
    "nextLabel": "Հաջորդ հրապարակում",
    "asOf": "դրությամբ",
    "empty": "Առայժմ հրապարակումներ չկան։ Շուտով կտեղադրվեն ընթացիկ ամփոփումները։",
    "badge": "ՄԻՋԱՆԿՅԱԼ ԱՄՓՈՓՈՒՄ"
  },
```

- [ ] **Step 2: Add English + Russian stubs**

In `messages/en.json`, add `"live": "Live"` to `Nav` and:

```json
  "Live": {
    "title": "Live",
    "subtitle": "Real-time monitoring of the electoral process",
    "disclaimer": "Observer-reported data based on our observers' reports. These are not official CEC results and may cover only a subset of polling stations.",
    "dashboardTitle": "Current figures",
    "feedTitle": "Updates",
    "issuesTitle": "Main issues and concerns",
    "casesTitle": "Notable cases",
    "stationsLabel": "Station(s)",
    "nextLabel": "Next update",
    "asOf": "as of",
    "empty": "No updates yet. Interim summaries will appear here soon.",
    "badge": "INTERIM SUMMARY"
  },
```

In `messages/ru.json`, add `"live": "Прямой эфир"` to `Nav` and:

```json
  "Live": {
    "title": "Прямой эфир",
    "subtitle": "Мониторинг избирательного процесса в реальном времени",
    "disclaimer": "Данные наблюдателей на основе сообщений наших наблюдателей. Это не официальные результаты ЦИК и могут охватывать лишь часть участков.",
    "dashboardTitle": "Текущие показатели",
    "feedTitle": "Публикации",
    "issuesTitle": "Основные проблемы и опасения",
    "casesTitle": "Отдельные случаи",
    "stationsLabel": "Участок(и)",
    "nextLabel": "Следующая публикация",
    "asOf": "по состоянию на",
    "empty": "Пока нет публикаций. Промежуточные сводки появятся здесь скоро.",
    "badge": "ПРОМЕЖУТОЧНАЯ СВОДКА"
  },
```

- [ ] **Step 3: Add the nav link**

In `components/Header.tsx`, add `/live` as the first secondary link so it gets prominence on election day:

```tsx
  const secondaryLinks = [
    { href: `/${locale}/live`, label: t('live') },
    { href: `/${locale}/info`, label: t('info') },
    { href: `/${locale}/map`, label: t('map') },
    { href: `/${locale}/stats`, label: t('stats') },
    { href: `/${locale}/about`, label: t('about') },
  ];
```

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add messages/am.json messages/en.json messages/ru.json components/Header.tsx
git commit -m "feat(live): i18n strings + nav link"
```

---

## Task 6: presentational components

**Files:**
- Create: `components/live/CounterCards.tsx`
- Create: `components/live/SummaryCard.tsx`
- Create: `components/live/FlashCard.tsx`
- Create: `components/live/AutoRefresh.tsx`

- [ ] **Step 1: CounterCards**

Create `components/live/CounterCards.tsx`:

```tsx
import type { Locale } from '@/lib/i18n/routing';
import type { LiveCounter } from '@/lib/live/types';
import { counterLabel, formatCount } from '@/lib/live/format';

export function CounterCards({
  counters,
  locale,
  variant = 'dashboard',
}: {
  counters: LiveCounter[];
  locale: Locale;
  variant?: 'dashboard' | 'compact';
}) {
  if (!counters.length) return null;
  return (
    <div
      className={
        variant === 'dashboard'
          ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid gap-3 sm:grid-cols-3'
      }
    >
      {counters.map((c) => (
        <div
          key={c.id}
          className="rounded-2xl border border-navy-900/10 bg-cream-50 p-5"
        >
          {c.icon ? (
            <div className="text-2xl" aria-hidden>
              {c.icon}
            </div>
          ) : null}
          <div className="mt-1 font-display text-4xl font-bold tabular-nums text-navy-900">
            {formatCount(c.value, locale)}
          </div>
          <div className="mt-1 text-sm font-medium text-navy-700">
            {counterLabel(c, locale)}
          </div>
          {c.note ? (
            <div className="mt-0.5 text-xs text-navy-700/70">{c.note}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: SummaryCard**

Create `components/live/SummaryCard.tsx`:

```tsx
import type { Locale } from '@/lib/i18n/routing';
import type { LivePost } from '@/lib/db/schema';
import { pickContent, formatTime } from '@/lib/live/format';
import { CounterCards } from './CounterCards';

type Labels = {
  issuesTitle: string;
  casesTitle: string;
  nextLabel: string;
  badge: string;
};

export function SummaryCard({
  post,
  locale,
  labels,
}: {
  post: LivePost;
  locale: Locale;
  labels: Labels;
}) {
  const c = pickContent(post.content, locale);
  const time = formatTime(post.asOf ?? post.publishedAt, locale);
  return (
    <article className="overflow-hidden rounded-3xl border border-navy-900/10 bg-cream-50 shadow-sm">
      <div className="flex items-center justify-between gap-3 bg-navy-900 px-6 py-4 text-cream-50">
        <span className="inline-flex items-center gap-2 rounded-full bg-orange px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-950">
          {c.badge ?? labels.badge}
        </span>
        <span className="text-sm font-semibold tabular-nums">{time}</span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl font-bold text-navy-900">
          {c.title}
        </h3>
        {c.intro ? (
          <p className="mt-3 whitespace-pre-line text-navy-700">{c.intro}</p>
        ) : null}
        {c.highlight ? (
          <div className="mt-4 rounded-2xl bg-navy-900 px-5 py-4 text-cream-50">
            <p className="whitespace-pre-line text-sm leading-relaxed">
              {c.highlight}
            </p>
          </div>
        ) : null}
        {post.counters?.length ? (
          <div className="mt-6">
            <CounterCards counters={post.counters} locale={locale} variant="compact" />
          </div>
        ) : null}
        {c.issues?.length ? (
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
              {labels.issuesTitle}
            </h4>
            <ul className="mt-3 space-y-2">
              {c.issues.map((it, i) => (
                <li key={i} className="flex gap-2 text-sm text-navy-800">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange"
                    aria-hidden
                  />
                  <span className="whitespace-pre-line">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {c.cases?.length ? (
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
              {labels.casesTitle}
            </h4>
            <ul className="mt-3 space-y-3">
              {c.cases.map((cs, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-navy-900/10 bg-cream-100 p-3"
                >
                  {cs.stations ? (
                    <span className="mr-2 inline-block rounded-md bg-navy-900/10 px-2 py-0.5 text-xs font-bold tabular-nums text-navy-900">
                      {cs.stations}
                    </span>
                  ) : null}
                  <span className="text-sm text-navy-800">{cs.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {c.nextNote ? (
          <div className="mt-6 rounded-xl border-l-4 border-orange bg-orange/5 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange">
              {labels.nextLabel}
            </span>
            <p className="mt-1 whitespace-pre-line text-sm text-navy-800">
              {c.nextNote}
            </p>
          </div>
        ) : null}
        {c.hashtags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {c.hashtags.map((h, i) => (
              <span
                key={i}
                className="rounded-full bg-navy-900/5 px-3 py-1 text-xs font-medium text-navy-700"
              >
                #{h}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: FlashCard**

Create `components/live/FlashCard.tsx`:

```tsx
import type { Locale } from '@/lib/i18n/routing';
import type { LivePost } from '@/lib/db/schema';
import { pickContent, formatTime } from '@/lib/live/format';

export function FlashCard({
  post,
  locale,
}: {
  post: LivePost;
  locale: Locale;
}) {
  const c = pickContent(post.content, locale);
  const time = formatTime(post.asOf ?? post.publishedAt, locale);
  return (
    <article className="flex gap-4 rounded-2xl border border-navy-900/10 bg-cream-50 px-5 py-4">
      <span className="shrink-0 pt-0.5 text-sm font-bold tabular-nums text-orange">
        {time}
      </span>
      <div>
        <h3 className="font-semibold text-navy-900">{c.title}</h3>
        {c.intro ? (
          <p className="mt-1 whitespace-pre-line text-sm text-navy-700">
            {c.intro}
          </p>
        ) : null}
      </div>
    </article>
  );
}
```

- [ ] **Step 4: AutoRefresh**

Create `components/live/AutoRefresh.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Re-runs the server component on an interval so ISR-cached content stays fresh
 * without a manual reload. The interval is established in useEffect (client
 * only) — never bound to a render-time environment check.
 */
export function AutoRefresh({ intervalMs = 30000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      try {
        router.refresh();
      } catch {
        // no-op: never let a refresh failure break the page
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
```

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/live/
git commit -m "feat(live): presentational components (cards + auto-refresh)"
```

---

## Task 7: public `/live` page

**Files:**
- Create: `app/[locale]/live/page.tsx`

- [ ] **Step 1: Implement the page**

Create `app/[locale]/live/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { loadLivePosts, latestCounters } from '@/lib/live/queries';
import { formatTime } from '@/lib/live/format';
import { CounterCards } from '@/components/live/CounterCards';
import { SummaryCard } from '@/components/live/SummaryCard';
import { FlashCard } from '@/components/live/FlashCard';
import { AutoRefresh } from '@/components/live/AutoRefresh';

export const revalidate = 30;

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Live');

  const posts = await loadLivePosts();
  const latest = latestCounters(posts);
  const labels = {
    issuesTitle: t('issuesTitle'),
    casesTitle: t('casesTitle'),
    nextLabel: t('nextLabel'),
    badge: t('badge'),
  };

  return (
    <main className="container-main py-12">
      <AutoRefresh intervalMs={30000} />

      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {t('title')}
      </h1>
      <p className="mt-3 text-navy-700">{t('subtitle')}</p>
      <p className="mt-2 text-sm text-navy-700/70">{t('disclaimer')}</p>

      {latest ? (
        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-navy-900">
              {t('dashboardTitle')}
            </h2>
            <span className="text-sm text-navy-700/70">
              {formatTime(latest.asOf, locale)} {t('asOf')}
            </span>
          </div>
          <div className="mt-4">
            <CounterCards counters={latest.counters} locale={locale} />
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-navy-900">
          {t('feedTitle')}
        </h2>
        {posts.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-navy-900/10 bg-cream-50 px-5 py-8 text-center text-navy-700">
            {t('empty')}
          </p>
        ) : (
          <div className="mt-6 space-y-8">
            {posts.map((p) =>
              p.kind === 'flash' ? (
                <FlashCard key={p.id} post={p} locale={locale} />
              ) : (
                <SummaryCard key={p.id} post={p} locale={locale} labels={labels} />
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: PASS — `/[locale]/live` appears in the route list; build succeeds even though `live_posts` may not exist yet (empty-state path).

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/live/page.tsx
git commit -m "feat(live): public /live page (dashboard + feed)"
```

---

## Task 8: admin CRUD API

**Files:**
- Create: `app/api/admin/live/route.ts`

- [ ] **Step 1: Implement the route**

Create `app/api/admin/live/route.ts`:

```ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, hasDatabase, schema } from '@/lib/db/client';
import { livePostInputSchema, livePostPatchSchema } from '@/lib/live/schema';

// Mirrors the inline basic-auth check in app/api/admin/moderate/route.ts.
// Returns a Response when the request is NOT authorized, or null when it is.
function checkAuth(req: NextRequest): Response | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return Response.json({ error: 'admin_disabled' }, { status: 503 });
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Basic ')) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const decoded = atob(auth.slice('Basic '.length));
    const idx = decoded.indexOf(':');
    if (decoded.slice(0, idx) !== 'admin' || decoded.slice(idx + 1) !== expected) {
      return Response.json({ error: 'unauthorized' }, { status: 401 });
    }
  } catch {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

async function readJson(req: NextRequest): Promise<unknown | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const gate = checkAuth(req);
  if (gate) return gate;
  if (!hasDatabase) return Response.json({ error: 'no_db' }, { status: 503 });

  const body = await readJson(req);
  if (body === null) return Response.json({ error: 'invalid_json' }, { status: 400 });
  const parsed = livePostInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'validation', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const db = getDb();
  const [row] = await db
    .insert(schema.livePosts)
    .values({
      kind: d.kind,
      pinned: d.pinned,
      ...(d.publishedAt ? { publishedAt: d.publishedAt } : {}),
      asOf: d.asOf ?? null,
      counters: d.counters,
      content: d.content,
    })
    .returning({ id: schema.livePosts.id });
  return Response.json({ ok: true, id: row.id });
}

export async function PATCH(req: NextRequest) {
  const gate = checkAuth(req);
  if (gate) return gate;
  if (!hasDatabase) return Response.json({ error: 'no_db' }, { status: 503 });

  const body = await readJson(req);
  if (body === null) return Response.json({ error: 'invalid_json' }, { status: 400 });
  const parsed = livePostPatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'validation', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { id, ...rest } = parsed.data;
  const db = getDb();
  const [row] = await db
    .update(schema.livePosts)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(schema.livePosts.id, id))
    .returning({ id: schema.livePosts.id });
  if (!row) return Response.json({ error: 'not_found' }, { status: 404 });
  return Response.json({ ok: true, id: row.id });
}

export async function DELETE(req: NextRequest) {
  const gate = checkAuth(req);
  if (gate) return gate;
  if (!hasDatabase) return Response.json({ error: 'no_db' }, { status: 503 });

  const body = await readJson(req);
  if (body === null) return Response.json({ error: 'invalid_json' }, { status: 400 });
  const id = z
    .string()
    .uuid()
    .safeParse((body as { id?: unknown })?.id);
  if (!id.success) return Response.json({ error: 'validation' }, { status: 400 });
  const db = getDb();
  const [row] = await db
    .delete(schema.livePosts)
    .where(eq(schema.livePosts.id, id.data))
    .returning({ id: schema.livePosts.id });
  if (!row) return Response.json({ error: 'not_found' }, { status: 404 });
  return Response.json({ ok: true });
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/live/route.ts
git commit -m "feat(live): admin CRUD API for live posts"
```

---

## Task 9: admin editor UI

**Files:**
- Create: `app/admin/live/page.tsx`
- Create: `app/admin/live/LiveEditor.tsx`

> Note: this uses plain React `useState` (not react-hook-form) for the structured editor — fewer moving parts and lower risk to author correctly under election-day time pressure. The spec's RHF mention was a convenience note, not a requirement.

- [ ] **Step 1: Server page (list + DB guard)**

Create `app/admin/live/page.tsx`:

```tsx
import { desc } from 'drizzle-orm';
import { getDb, hasDatabase, schema } from '@/lib/db/client';
import { LiveEditor } from './LiveEditor';

export const dynamic = 'force-dynamic';

export default async function AdminLivePage() {
  if (!hasDatabase) {
    return (
      <main className="min-h-screen bg-cream-50 px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl border-2 border-orange/40 bg-orange/5 p-8">
          <h1 className="font-display text-2xl font-bold text-navy-900">
            Database not configured
          </h1>
          <p className="mt-2 text-sm text-navy-700">
            Set DATABASE_URL to manage live posts.
          </p>
        </div>
      </main>
    );
  }

  let posts: (typeof schema.livePosts.$inferSelect)[] = [];
  let loadError: string | null = null;
  try {
    const db = getDb();
    posts = await db
      .select()
      .from(schema.livePosts)
      .orderBy(desc(schema.livePosts.publishedAt));
  } catch (e) {
    console.warn('[ditaket] admin/live: load failed (schema not pushed?)', e);
    loadError = 'Failed to load live posts. Run `pnpm db:push` with the prod env.';
  }

  return (
    <main className="min-h-screen bg-cream-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-navy-900">
          Live updates
        </h1>
        <p className="mt-1 text-sm text-navy-700">
          Authored mission updates shown at /live. Dashboard counters use the
          newest interim summary.
        </p>
        {loadError ? (
          <p className="mt-4 rounded-xl bg-orange/10 px-4 py-3 text-sm text-navy-800">
            {loadError}
          </p>
        ) : null}
        <LiveEditor initialPosts={JSON.parse(JSON.stringify(posts))} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Client editor**

Create `app/admin/live/LiveEditor.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  LiveCounter,
  LivePostContent,
  LivePostKind,
  SummaryContent,
} from '@/lib/live/types';

type EditorPost = {
  id: string;
  kind: LivePostKind;
  pinned: boolean;
  publishedAt: string;
  asOf: string | null;
  counters: LiveCounter[];
  content: LivePostContent;
};

type Draft = {
  id: string | null;
  kind: LivePostKind;
  pinned: boolean;
  asOf: string; // 'HH:MM' local, optional
  counters: LiveCounter[];
  am: Required<Pick<SummaryContent, 'title'>> & SummaryContent;
};

const EMPTY_DRAFT: Draft = {
  id: null,
  kind: 'interim_summary',
  pinned: false,
  asOf: '',
  counters: [],
  am: {
    badge: '',
    title: '',
    intro: '',
    highlight: '',
    issues: [],
    cases: [],
    nextNote: '',
    hashtags: [],
  },
};

const input =
  'w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2 text-sm text-navy-900';
const label = 'block text-xs font-semibold uppercase tracking-wide text-navy-700';
const btn =
  'rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50';

// Build an ISO datetime for today at the given HH:MM (local), or null.
function asOfIso(hhmm: string): string | null {
  if (!/^\d{1,2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function LiveEditor({ initialPosts }: { initialPosts: EditorPost[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setAm = (patch: Partial<SummaryContent>) =>
    setDraft((d) => ({ ...d, am: { ...d.am, ...patch } }));

  // --- counters ---
  const addCounter = () =>
    setDraft((d) => ({
      ...d,
      counters: [
        ...d.counters,
        { id: `c${d.counters.length + 1}`, icon: '', value: 0, labelAm: '' },
      ],
    }));
  const updateCounter = (i: number, patch: Partial<LiveCounter>) =>
    setDraft((d) => ({
      ...d,
      counters: d.counters.map((c, j) => (j === i ? { ...c, ...patch } : c)),
    }));
  const removeCounter = (i: number) =>
    setDraft((d) => ({ ...d, counters: d.counters.filter((_, j) => j !== i) }));

  // --- issues ---
  const issues = draft.am.issues ?? [];
  const setIssues = (next: string[]) => setAm({ issues: next });

  // --- cases ---
  const cases = draft.am.cases ?? [];
  const setCases = (next: { stations?: string; text: string }[]) =>
    setAm({ cases: next });

  function loadForEdit(p: EditorPost) {
    const am = p.content.am ?? { title: '' };
    const asOf = p.asOf
      ? new Date(p.asOf).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    setDraft({
      id: p.id,
      kind: p.kind,
      pinned: p.pinned,
      asOf,
      counters: p.counters ?? [],
      am: {
        badge: am.badge ?? '',
        title: am.title ?? '',
        intro: am.intro ?? '',
        highlight: am.highlight ?? '',
        issues: am.issues ?? [],
        cases: am.cases ?? [],
        nextNote: am.nextNote ?? '',
        hashtags: am.hashtags ?? [],
      },
    });
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildPayload() {
    // Strip empty optional fields so we store clean content.
    const am: SummaryContent = { title: draft.am.title.trim() };
    if (draft.am.badge?.trim()) am.badge = draft.am.badge.trim();
    if (draft.am.intro?.trim()) am.intro = draft.am.intro.trim();
    if (draft.am.highlight?.trim()) am.highlight = draft.am.highlight.trim();
    const cleanIssues = (draft.am.issues ?? [])
      .map((s) => s.trim())
      .filter(Boolean);
    if (cleanIssues.length) am.issues = cleanIssues;
    const cleanCases = (draft.am.cases ?? [])
      .map((c) => ({ stations: c.stations?.trim(), text: c.text.trim() }))
      .filter((c) => c.text);
    if (cleanCases.length) am.cases = cleanCases;
    if (draft.am.nextNote?.trim()) am.nextNote = draft.am.nextNote.trim();
    const cleanTags = (draft.am.hashtags ?? [])
      .map((s) => s.trim().replace(/^#/, ''))
      .filter(Boolean);
    if (cleanTags.length) am.hashtags = cleanTags;

    const counters = draft.counters
      .filter((c) => c.labelAm.trim())
      .map((c) => ({
        id: c.id,
        value: Number(c.value) || 0,
        labelAm: c.labelAm.trim(),
        ...(c.icon?.trim() ? { icon: c.icon.trim() } : {}),
        ...(c.note?.trim() ? { note: c.note.trim() } : {}),
      }));

    return {
      kind: draft.kind,
      pinned: draft.pinned,
      asOf: asOfIso(draft.asOf),
      counters,
      content: { am },
    };
  }

  async function save() {
    if (!draft.am.title.trim()) {
      setMsg('Title is required.');
      return;
    }
    setBusy(true);
    setMsg(null);
    const payload = buildPayload();
    const res = await fetch('/api/admin/live', {
      method: draft.id ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(draft.id ? { id: draft.id, ...payload } : payload),
    });
    setBusy(false);
    if (res.ok) {
      setDraft(EMPTY_DRAFT);
      setMsg('Saved.');
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      setMsg(`Error: ${err.error ?? res.status}`);
    }
  }

  async function pinToggle(p: EditorPost) {
    await fetch('/api/admin/live', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: p.id, pinned: !p.pinned }),
    });
    router.refresh();
  }

  async function remove(p: EditorPost) {
    if (!confirm('Delete this post?')) return;
    await fetch('/api/admin/live', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: p.id }),
    });
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-10">
      {/* Editor */}
      <section className="rounded-2xl border border-navy-900/15 bg-white p-5">
        <h2 className="font-display text-xl font-bold text-navy-900">
          {draft.id ? 'Edit post' : 'New post'}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={label}>Kind</label>
            <select
              className={input}
              value={draft.kind}
              onChange={(e) =>
                setDraft((d) => ({ ...d, kind: e.target.value as LivePostKind }))
              }
            >
              <option value="interim_summary">Interim summary</option>
              <option value="flash">Flash (short)</option>
            </select>
          </div>
          <div>
            <label className={label}>As of (HH:MM)</label>
            <input
              className={input}
              placeholder="13:00"
              value={draft.asOf}
              onChange={(e) => setDraft((d) => ({ ...d, asOf: e.target.value }))}
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm text-navy-800">
            <input
              type="checkbox"
              checked={draft.pinned}
              onChange={(e) =>
                setDraft((d) => ({ ...d, pinned: e.target.checked }))
              }
            />
            Pinned
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Badge</label>
            <input
              className={input}
              value={draft.am.badge ?? ''}
              onChange={(e) => setAm({ badge: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Title *</label>
            <input
              className={input}
              value={draft.am.title}
              onChange={(e) => setAm({ title: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={label}>Intro</label>
          <textarea
            className={`${input} min-h-20`}
            value={draft.am.intro ?? ''}
            onChange={(e) => setAm({ intro: e.target.value })}
          />
        </div>

        <div className="mt-4">
          <label className={label}>Highlight box</label>
          <textarea
            className={`${input} min-h-16`}
            value={draft.am.highlight ?? ''}
            onChange={(e) => setAm({ highlight: e.target.value })}
          />
        </div>

        {/* Counters */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Counters</h3>
            <button
              type="button"
              className={`${btn} bg-navy-900/10 text-navy-900`}
              onClick={addCounter}
            >
              + Add counter
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {draft.counters.map((c, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input
                  className={`${input} col-span-2`}
                  placeholder="📄"
                  value={c.icon ?? ''}
                  onChange={(e) => updateCounter(i, { icon: e.target.value })}
                />
                <input
                  className={`${input} col-span-2`}
                  type="number"
                  value={c.value}
                  onChange={(e) =>
                    updateCounter(i, { value: Number(e.target.value) })
                  }
                />
                <input
                  className={`${input} col-span-4`}
                  placeholder="Label (Armenian)"
                  value={c.labelAm}
                  onChange={(e) => updateCounter(i, { labelAm: e.target.value })}
                />
                <input
                  className={`${input} col-span-3`}
                  placeholder="Note (optional)"
                  value={c.note ?? ''}
                  onChange={(e) => updateCounter(i, { note: e.target.value })}
                />
                <button
                  type="button"
                  className={`${btn} col-span-1 bg-orange/20 text-orange-800`}
                  onClick={() => removeCounter(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Issues */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Issues</h3>
            <button
              type="button"
              className={`${btn} bg-navy-900/10 text-navy-900`}
              onClick={() => setIssues([...issues, ''])}
            >
              + Add issue
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {issues.map((it, i) => (
              <div key={i} className="flex gap-2">
                <textarea
                  className={`${input} min-h-12`}
                  value={it}
                  onChange={(e) =>
                    setIssues(issues.map((x, j) => (j === i ? e.target.value : x)))
                  }
                />
                <button
                  type="button"
                  className={`${btn} bg-orange/20 text-orange-800`}
                  onClick={() => setIssues(issues.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cases */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Notable cases</h3>
            <button
              type="button"
              className={`${btn} bg-navy-900/10 text-navy-900`}
              onClick={() => setCases([...cases, { stations: '', text: '' }])}
            >
              + Add case
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {cases.map((cs, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input
                  className={`${input} col-span-3`}
                  placeholder="33/23, 29/54"
                  value={cs.stations ?? ''}
                  onChange={(e) =>
                    setCases(
                      cases.map((x, j) =>
                        j === i ? { ...x, stations: e.target.value } : x,
                      ),
                    )
                  }
                />
                <textarea
                  className={`${input} col-span-8 min-h-12`}
                  placeholder="Description"
                  value={cs.text}
                  onChange={(e) =>
                    setCases(
                      cases.map((x, j) =>
                        j === i ? { ...x, text: e.target.value } : x,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className={`${btn} col-span-1 bg-orange/20 text-orange-800`}
                  onClick={() => setCases(cases.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className={label}>Next-publication note</label>
          <textarea
            className={`${input} min-h-16`}
            value={draft.am.nextNote ?? ''}
            onChange={(e) => setAm({ nextNote: e.target.value })}
          />
        </div>

        <div className="mt-4">
          <label className={label}>Hashtags (comma-separated)</label>
          <input
            className={input}
            value={(draft.am.hashtags ?? []).join(', ')}
            onChange={(e) =>
              setAm({
                hashtags: e.target.value.split(',').map((s) => s.trim()),
              })
            }
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            className={`${btn} bg-orange text-navy-950`}
            disabled={busy}
            onClick={save}
          >
            {draft.id ? 'Update' : 'Publish'}
          </button>
          {draft.id ? (
            <button
              type="button"
              className={`${btn} bg-navy-900/10 text-navy-900`}
              onClick={() => setDraft(EMPTY_DRAFT)}
            >
              Cancel edit
            </button>
          ) : null}
          {msg ? <span className="text-sm text-navy-700">{msg}</span> : null}
        </div>
      </section>

      {/* Existing posts */}
      <section>
        <h2 className="font-display text-xl font-bold text-navy-900">
          Posts ({initialPosts.length})
        </h2>
        <ul className="mt-3 space-y-2">
          {initialPosts.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-navy-900/10 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <span className="mr-2 rounded bg-navy-900/10 px-1.5 py-0.5 text-xs font-semibold text-navy-700">
                  {p.kind === 'flash' ? 'flash' : 'summary'}
                </span>
                {p.pinned ? (
                  <span className="mr-2 text-xs font-bold text-orange">PINNED</span>
                ) : null}
                <span className="text-sm text-navy-900">
                  {p.content.am?.title ?? '(untitled)'}
                </span>
                <span className="ml-2 text-xs text-navy-700/60">
                  {new Date(p.publishedAt).toLocaleString('en-GB')}
                </span>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  className={`${btn} bg-navy-900/10 text-navy-900`}
                  onClick={() => loadForEdit(p)}
                >
                  Edit
                </button>
                <button
                  className={`${btn} bg-navy-900/10 text-navy-900`}
                  onClick={() => pinToggle(p)}
                >
                  {p.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  className={`${btn} bg-orange/20 text-orange-800`}
                  onClick={() => remove(p)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + build**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/admin/live/page.tsx app/admin/live/LiveEditor.tsx
git commit -m "feat(live): admin editor for live posts"
```

---

## Task 10: cross-link + final smoke

**Files:**
- Modify: `app/[locale]/stats/page.tsx`

- [ ] **Step 1: Link /stats → /live**

In `app/[locale]/stats/page.tsx`, under the existing `unverifiedNotice` paragraph near the top, add a link to the live page. After this block:

```tsx
      <p className="mt-3 text-sm text-navy-700/70">
        {tCommon('unverifiedNotice')}
      </p>
```

add:

```tsx
      <p className="mt-2 text-sm">
        <a
          href={`/${locale}/live`}
          className="font-semibold text-orange hover:text-orange-600"
        >
          {tNav('live')} →
        </a>
      </p>
```

(`tNav` and `locale` already exist in this component.)

- [ ] **Step 2: Typecheck + build**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/stats/page.tsx
git commit -m "feat(live): cross-link from stats to live"
```

- [ ] **Step 4: Manual browser smoke (requires DB pushed + ADMIN_PASSWORD set)**

Pre-req: the user has run `pnpm db:push` and `ADMIN_PASSWORD` is set. Then run `pnpm dev` and verify:

1. Visit `/am/live` → shows header, disclaimer, empty-state feed (no crash) when no posts.
2. Visit `/admin/live` (basic-auth `admin` / `$ADMIN_PASSWORD`) → reproduce the 13:00 summary: badge `ՄԻՋԱՆԿՅԱԼ ԱՄՓՈՓՈՒՄ`, title `Ընտրական գործընթացի մշտադիտարկում`, as-of `13:00`, three counters (📄 6 / 🛠 46 / ☎️ 24) plus turnout, a few issues, the notable cases (`33/23, 29/54`, `25/28`, `32/15`), next-note, hashtags → Publish.
3. Back on `/am/live` (or wait ≤30s for auto-refresh) → dashboard shows the counters with `13:00 դրությամբ`; the summary card renders natively with the navy header, orange badge, counter grid, issues, cases, hashtags.
4. Add a `flash` post → appears as a compact line; pin it → it sorts to the top.
5. Edit then delete a post → list updates after `router.refresh()`.
6. Switch to `/en/live` → static UI labels translate; authored content falls back to Armenian.

Document any deviations; fix forward.

---

## Self-Review (completed during planning)

- **Spec coverage:** `/live` route ✓ (T7); dashboard from latest counters ✓ (T4/T7); native feed cards ✓ (T6); `interim_summary` + `flash` ✓ (T1/T6); admin manual entry ✓ (T8/T9); absolute turnout as a counter (no %) ✓ (counter model, no denominator); Armenian-first with am fallback ✓ (T3/T5); one `live_posts` jsonb table ✓ (T1); auto-refresh + revalidate ✓ (T6/T7); disclaimer ✓ (T5/T7); basic-auth reuse ✓ (T8); empty-state / build-safe when schema absent ✓ (T4/T7/T9). Non-goals (PNG export, en/ru authored content, per-station ingestion, websockets, turnout chart) correctly excluded.
- **Placeholder scan:** none — every code step is complete.
- **Type consistency:** `LiveCounter`/`SummaryContent`/`LivePostContent` (T1) are reused verbatim by schema (T2), format (T3), queries (T4), components (T6), and editor (T9). `LivePost` = `livePosts.$inferSelect` (T1) used by queries/components. API field names (`kind`, `pinned`, `publishedAt`, `asOf`, `counters`, `content`) match the table and schemas. `formatTime`/`formatCount`/`pickContent`/`counterLabel` signatures are consistent across producer (T3) and consumers (T6/T7).
```
