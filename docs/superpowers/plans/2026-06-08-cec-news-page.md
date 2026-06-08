# CEC News Page (`/news`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, trilingual `/news` page that presents the CEC's (elections.am) 2026-election-cycle news as a featured hero + responsive card grid, each item summarised and linked to its official source.

**Architecture:** A one-shot importer script scrapes elections.am (browser User-Agent → HTTP 200) into `data/cec-news.raw.json` + local images in `public/news/`. We hand-author trilingual summaries into a typed content module `lib/content/cec-news.ts` (mirrors the existing `lib/content/*.ts` pattern). A static server-component page renders the module via small presentational components. No database, no admin, no API routes.

**Tech Stack:** Next.js 15 App Router, TypeScript, next-intl (am/en/ru), Tailwind (navy/orange/cream design tokens), tsx for the script, Node 20 global `fetch`. No new dependencies.

> **Note on testing:** This repo has no test runner (no jest/vitest, no `test` script in `package.json`), and the spec explicitly says not to fabricate one. Logic here is a one-shot importer (verified by running it and inspecting output) plus presentational UI (verified by `next build`, `next lint`, and a visual render check in all three locales). Verification steps below use those real commands and their expected output instead of unit tests.

---

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `scripts/import-cec-news.ts` | Fetch + parse CEC news, download images, emit raw JSON | Create |
| `package.json` | Add `import:news` script | Modify |
| `data/cec-news.raw.json` | Raw scraped items (intermediate, committed) | Create (generated) |
| `public/news/*.jpg` | Downloaded item images | Create (generated) |
| `lib/content/cec-news.ts` | `CecNewsItem` type + `CEC_NEWS` data array | Create |
| `lib/news/format.ts` | `formatNewsDate(iso, locale)` | Create |
| `components/news/NewsThumb.tsx` | Image-or-fallback thumbnail | Create |
| `components/news/NewsCard.tsx` | Grid card | Create |
| `components/news/FeaturedNewsCard.tsx` | Hero card | Create |
| `app/[locale]/news/page.tsx` | The page | Create |
| `messages/{en,am,ru}.json` | `Nav.news` + `News` namespace | Modify |
| `components/Header.tsx` | Add `/news` nav link | Modify |
| `app/sitemap.ts` | Add `/news` route | Modify |

`components/MobileMenu.tsx` needs **no change** — it renders whatever `links` Header passes.

---

## Task 1: Importer script

**Files:**
- Create: `scripts/import-cec-news.ts`
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Write the importer**

Create `scripts/import-cec-news.ts`:

```ts
/**
 * Import CEC (elections.am) news for the 2026 parliamentary election cycle.
 *
 * elections.am returns HTTP 403 to default fetchers but 200 to a desktop
 * browser User-Agent. News lives at /News (listing) and /News/Item/{id}
 * (sequential numeric ids; higher id = newer).
 *
 * This walks ids descending from the newest, parses title/date/body/image,
 * downloads images to public/news/, and writes data/cec-news.raw.json.
 * It STOPS once it sees a run of items older than --since (default 2026-01-01),
 * then prints the captured date range for human confirmation of the cycle
 * boundary. Summaries + translations are authored by hand afterwards (Task 7).
 *
 *   pnpm import:news                 # default since=2026-01-01
 *   pnpm import:news --since=2026-03-01
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://www.elections.am';
const DEFAULT_SINCE = '2026-01-01';
const MAX_MISSES = 8; // stop after this many consecutive pre-cycle/empty items

type RawItem = {
  id: number;
  sourceUrl: string;
  date: string; // ISO YYYY-MM-DD
  titleAm: string;
  bodyAm: string; // best-effort; re-read live page when authoring summaries
  image?: string; // local path, e.g. /news/2018.jpg
  imageSource?: string; // original res.elections.am URL
};

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»');
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

async function latestId(): Promise<number> {
  const html = await fetchHtml(`${BASE}/News`);
  const ids = [...html.matchAll(/\/News\/Item\/(\d+)/g)].map((m) => Number(m[1]));
  if (ids.length === 0) throw new Error('No /News/Item/{id} links on listing');
  return Math.max(...ids);
}

function parseItem(id: number, html: string): RawItem {
  const single =
    html.match(/<div class="blog-post-single"[\s\S]*?(?=<footer|<\/main|$)/)?.[0] ?? html;
  const h2 = single.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
  const titleTag = html.match(/<title>([\s\S]*?)<\/title>/);
  const titleAm = stripTags(h2?.[1] ?? titleTag?.[1] ?? '');

  const dmy = single.match(/(\d{2})-(\d{2})-(\d{4})/) ?? html.match(/(\d{2})-(\d{2})-(\d{4})/);
  const date = dmy ? `${dmy[3]}-${dmy[2]}-${dmy[1]}` : '';

  const content = single.match(
    /class="post-content"[^>]*>([\s\S]*?)(?=<div class="post-meta-track"|<\/article>|<footer|$)/,
  );
  const bodyAm = stripTags(content?.[1] ?? single);

  const img = single.match(
    /https?:\/\/res\.elections\.am\/images\/News\/[^"'\s)]+\.(?:jpe?g|png)/i,
  );

  return {
    id,
    sourceUrl: `${BASE}/News/Item/${id}`,
    date,
    titleAm,
    bodyAm,
    imageSource: img?.[0],
  };
}

async function downloadImage(url: string, id: number, outDir: string): Promise<string> {
  const ext = (url.match(/\.(jpe?g|png)$/i)?.[1] ?? 'jpg').toLowerCase().replace('jpeg', 'jpg');
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`image HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const file = `${id}.${ext}`;
  await writeFile(resolve(outDir, file), buf);
  return `/news/${file}`;
}

async function main() {
  const sinceArg = process.argv.find((a) => a.startsWith('--since='));
  const since = sinceArg ? sinceArg.split('=')[1]! : DEFAULT_SINCE;
  const publicDir = resolve(process.cwd(), 'public/news');
  await mkdir(publicDir, { recursive: true });

  const top = await latestId();
  console.log(`Latest news id: ${top}; collecting items dated >= ${since}`);

  const items: RawItem[] = [];
  let misses = 0;
  for (let id = top; id > 0 && misses < MAX_MISSES; id--) {
    let html: string;
    try {
      html = await fetchHtml(`${BASE}/News/Item/${id}`);
    } catch (e) {
      console.warn(`skip ${id}: ${(e as Error).message}`);
      continue;
    }
    const item = parseItem(id, html);
    if (!item.date || !item.titleAm) {
      console.warn(`skip ${id}: missing date/title`);
      continue;
    }
    if (item.date < since) {
      misses++;
      continue;
    }
    misses = 0;
    if (item.imageSource) {
      try {
        item.image = await downloadImage(item.imageSource, id, publicDir);
      } catch (e) {
        console.warn(`img ${id}: ${(e as Error).message}`);
      }
    }
    items.push(item);
    console.log(`  + ${id}  ${item.date}  ${item.titleAm.slice(0, 60)}`);
  }

  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  const out = resolve(process.cwd(), 'data/cec-news.raw.json');
  await writeFile(out, JSON.stringify(items, null, 2) + '\n', 'utf-8');

  console.log(`\nWrote ${items.length} items → ${out}`);
  console.log(`Date range: ${items.at(-1)?.date} … ${items[0]?.date}`);
  console.log('>> Confirm this boundary with the user before authoring summaries (Task 7).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Add the npm script**

In `package.json`, inside `"scripts"`, after `"import:coords": "tsx scripts/import-station-coords.ts"`, add:

```json
    "import:news": "tsx scripts/import-cec-news.ts"
```

(Remember to add the trailing comma to the previous line.)

- [ ] **Step 3: Run the importer**

Run: `pnpm import:news`
Expected: a list of `+ <id> <date> <title>` lines (newest-first as it walks down), then:
```
Wrote N items → .../data/cec-news.raw.json
Date range: 2026-MM-DD … 2026-06-08
>> Confirm this boundary with the user before authoring summaries (Task 7).
```
And `public/news/` populated with `*.jpg`/`*.png` files. If 0 items or all titles empty, the parsing regexes need adjustment — inspect one item page (`curl -A "<UA>" https://www.elections.am/News/Item/2018`) before proceeding.

- [ ] **Step 4: Commit**

```bash
git add scripts/import-cec-news.ts package.json data/cec-news.raw.json public/news
git commit -m "feat(news): CEC news importer + raw 2026-cycle data"
```

---

## Task 2: Content module (type + featured seed)

**Files:**
- Create: `lib/content/cec-news.ts`

- [ ] **Step 1: Write the type and seed it with the featured item**

Create `lib/content/cec-news.ts`. This defines the type and seeds **one fully-worked item** (the ratified-results item, id 2018) so the page renders and builds before the full corpus is authored in Task 7. Adjust `id`/`date`/`image` if the importer revealed a different newest item.

```ts
import type { Locale } from '@/lib/i18n/routing';

export type CecNewsItem = {
  id: number; // CEC item id, e.g. 2018
  sourceUrl: string; // https://www.elections.am/News/Item/2018
  date: string; // ISO 'YYYY-MM-DD'
  image?: string; // '/news/2018.jpg' (local) | undefined → fallback panel
  featured?: boolean; // exactly one item → hero
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
};

// Newest-first. 2026 RA parliamentary election cycle only.
export const CEC_NEWS: CecNewsItem[] = [
  {
    id: 2018,
    sourceUrl: 'https://www.elections.am/News/Item/2018',
    date: '2026-06-08',
    image: '/news/2018.jpg',
    featured: true,
    title: {
      am: 'ԿԸՀ-ն վավերացրել է քվեարկության նախնական արդյունքների արձանագրությունը',
      en: 'The CEC ratifies the protocol of preliminary voting results',
      ru: 'ЦИК утвердила протокол предварительных результатов голосования',
    },
    summary: {
      am: 'Կենտրոնական ընտրական հանձնաժողովը հաստատել է հունիսի 7-ի խորհրդարանական ընտրությունների քվեարկության նախնական արդյունքների ամփոփիչ արձանագրությունը։',
      en: 'The Central Electoral Commission approved the summary protocol of the preliminary results of the June 7 parliamentary election.',
      ru: 'Центральная избирательная комиссия утвердила итоговый протокол предварительных результатов парламентских выборов 7 июня.',
    },
  },
];
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors (exit 0).

- [ ] **Step 3: Commit**

```bash
git add lib/content/cec-news.ts
git commit -m "feat(news): CecNewsItem type + featured seed item"
```

---

## Task 3: Date formatter

**Files:**
- Create: `lib/news/format.ts`

- [ ] **Step 1: Write the formatter**

Create `lib/news/format.ts` (mirrors `lib/live/format.ts`'s locale handling; uses UTC so a date-only value never shifts across a day boundary):

```ts
import type { Locale } from '@/lib/i18n/routing';

function intlLocale(locale: Locale): string {
  return locale === 'am' ? 'hy-AM' : locale;
}

export function formatNewsDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors (exit 0).

- [ ] **Step 3: Commit**

```bash
git add lib/news/format.ts
git commit -m "feat(news): locale-aware news date formatter"
```

---

## Task 4: Card components

**Files:**
- Create: `components/news/NewsThumb.tsx`
- Create: `components/news/NewsCard.tsx`
- Create: `components/news/FeaturedNewsCard.tsx`

- [ ] **Step 1: Write `NewsThumb` (image-or-fallback)**

Create `components/news/NewsThumb.tsx`:

```tsx
import type { CecNewsItem } from '@/lib/content/cec-news';
import { cn } from '@/lib/utils';

export function NewsThumb({
  item,
  className,
}: {
  item: CecNewsItem;
  className?: string;
}) {
  if (item.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={item.image}
        alt=""
        loading="lazy"
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-navy-950',
        className,
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle at 20% -10%, rgba(232,133,42,0.30), transparent 55%), radial-gradient(circle at 90% 120%, rgba(232,133,42,0.12), transparent 50%)',
      }}
      aria-hidden="true"
    >
      <span className="font-display text-2xl font-bold tracking-[0.18em] text-cream/80">
        ԿԸՀ
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Write `NewsCard` (grid item)**

Create `components/news/NewsCard.tsx`:

```tsx
import type { Locale } from '@/lib/i18n/routing';
import type { CecNewsItem } from '@/lib/content/cec-news';
import { formatNewsDate } from '@/lib/news/format';
import { NewsThumb } from './NewsThumb';

export function NewsCard({
  item,
  locale,
  sourceLabel,
}: {
  item: CecNewsItem;
  locale: Locale;
  sourceLabel: string;
}) {
  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-900/15 bg-cream-50 transition-shadow hover:border-navy-900/30 hover:shadow-[0_8px_30px_rgba(19,36,63,0.08)]"
    >
      <NewsThumb item={item} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-5">
        <time
          dateTime={item.date}
          className="text-xs font-semibold uppercase tracking-wide text-orange"
        >
          {formatNewsDate(item.date, locale)}
        </time>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-navy-900">
          {item.title[locale]}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-navy-700">
          {item.summary[locale]}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange">
          {sourceLabel}
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </div>
    </a>
  );
}
```

- [ ] **Step 3: Write `FeaturedNewsCard` (hero)**

Create `components/news/FeaturedNewsCard.tsx`:

```tsx
import type { Locale } from '@/lib/i18n/routing';
import type { CecNewsItem } from '@/lib/content/cec-news';
import { formatNewsDate } from '@/lib/news/format';
import { NewsThumb } from './NewsThumb';

export function FeaturedNewsCard({
  item,
  locale,
  featuredLabel,
  sourceLabel,
}: {
  item: CecNewsItem;
  locale: Locale;
  featuredLabel: string;
  sourceLabel: string;
}) {
  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring group grid overflow-hidden rounded-3xl border border-navy-900/15 bg-cream-50 transition-shadow hover:shadow-[0_12px_40px_rgba(19,36,63,0.12)] md:grid-cols-2"
    >
      <NewsThumb
        item={item}
        className="aspect-[16/10] md:aspect-auto md:min-h-[18rem]"
      />
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">
            <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden="true" />
            {featuredLabel}
          </span>
          <time
            dateTime={item.date}
            className="text-xs font-semibold uppercase tracking-wide text-navy-700/70"
          >
            {formatNewsDate(item.date, locale)}
          </time>
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
          {item.title[locale]}
        </h2>
        <p className="mt-3 text-navy-700">{item.summary[locale]}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-orange">
          {sourceLabel}
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </div>
    </a>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors (exit 0).

- [ ] **Step 5: Commit**

```bash
git add components/news
git commit -m "feat(news): thumb, card, and featured-hero components"
```

---

## Task 5: News page

**Files:**
- Create: `app/[locale]/news/page.tsx`

- [ ] **Step 1: Write the page**

Create `app/[locale]/news/page.tsx` (static server component; mirrors `app/[locale]/live/page.tsx` minus the DB/revalidate):

```tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { CEC_NEWS } from '@/lib/content/cec-news';
import { FeaturedNewsCard } from '@/components/news/FeaturedNewsCard';
import { NewsCard } from '@/components/news/NewsCard';

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('News');

  const items = CEC_NEWS;
  const featured = items.find((i) => i.featured) ?? items[0];
  const rest = items.filter((i) => i !== featured);

  return (
    <main className="container-main py-12">
      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {t('title')}
      </h1>
      <p className="mt-3 max-w-prose text-navy-700">{t('subtitle')}</p>

      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-navy-900/10 bg-cream-50 px-5 py-8 text-center text-navy-700">
          {t('empty')}
        </p>
      ) : (
        <>
          {featured ? (
            <section className="mt-10">
              <FeaturedNewsCard
                item={featured}
                locale={locale}
                featuredLabel={t('featured')}
                sourceLabel={t('source')}
              />
            </section>
          ) : null}
          {rest.length > 0 ? (
            <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  sourceLabel={t('source')}
                />
              ))}
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Commit** (build verified after wiring in Task 6)

```bash
git add app/[locale]/news/page.tsx
git commit -m "feat(news): static /news page (hero + grid)"
```

---

## Task 6: Wiring (i18n, nav, sitemap)

**Files:**
- Modify: `messages/en.json`, `messages/am.json`, `messages/ru.json`
- Modify: `components/Header.tsx`
- Modify: `app/sitemap.ts`

- [ ] **Step 1: English messages**

In `messages/en.json`, add `"news": "News"` to the `Nav` object (after `"live": "Live"`), and add a new top-level `News` namespace:

```json
  "News": {
    "title": "CEC News",
    "subtitle": "Official Central Electoral Commission communications around the 2026 parliamentary election — summarised, with a link to each source.",
    "featured": "Key update",
    "source": "Read on elections.am",
    "empty": "News will appear here soon."
  },
```

- [ ] **Step 2: Armenian messages**

In `messages/am.json`, add `"news": "Նորություններ"` to `Nav`, and:

```json
  "News": {
    "title": "ԿԸՀ նորություններ",
    "subtitle": "Կենտրոնական ընտրական հանձնաժողովի պաշտոնական հաղորդագրությունները 2026 թ. խորհրդարանական ընտրությունների վերաբերյալ՝ ամփոփված, սկզբնաղբյուրի հղումով։",
    "featured": "Կարևոր",
    "source": "Կարդալ elections.am-ում",
    "empty": "Նորությունները շուտով կհայտնվեն այստեղ։"
  },
```

- [ ] **Step 3: Russian messages**

In `messages/ru.json`, add `"news": "Новости"` to `Nav`, and:

```json
  "News": {
    "title": "Новости ЦИК",
    "subtitle": "Официальные сообщения Центральной избирательной комиссии о парламентских выборах 2026 года — кратко, со ссылкой на источник.",
    "featured": "Важное",
    "source": "Читать на elections.am",
    "empty": "Новости скоро появятся здесь."
  },
```

- [ ] **Step 4: Add the nav link**

In `components/Header.tsx`, in the `secondaryLinks` array, add the news entry right after the `live` entry:

```tsx
  const secondaryLinks = [
    { href: `/${locale}/live`, label: t('live') },
    { href: `/${locale}/news`, label: t('news') },
    { href: `/${locale}/info`, label: t('info') },
    { href: `/${locale}/map`, label: t('map') },
    { href: `/${locale}/about`, label: t('about') },
  ];
```

- [ ] **Step 5: Add the sitemap route**

In `app/sitemap.ts`, add `'/news'` to the `STATIC_PATHS` array (after `'/live'`):

```ts
  '/live',
  '/news',
```

- [ ] **Step 6: Build + lint**

Run: `pnpm build`
Expected: build succeeds; output lists `/[locale]/news` as a static (prerendered) route, and no missing-message errors for the `News` namespace.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add messages components/Header.tsx app/sitemap.ts
git commit -m "feat(news): wire /news into nav, i18n, and sitemap"
```

---

## Task 7: Populate the full corpus (editorial)

**Files:**
- Modify: `lib/content/cec-news.ts`

This is the hand-authoring step. It depends on `data/cec-news.raw.json` from Task 1.

- [ ] **Step 1: Confirm the cycle boundary with the user**

Show the user the printed date range and the oldest captured item from Task 1. Confirm the oldest item that should be included (the natural start of the 2026 cycle). If the boundary is wrong, re-run `pnpm import:news --since=YYYY-MM-DD` with the corrected date.

- [ ] **Step 2: Author trilingual entries**

For every item in `data/cec-news.raw.json`, add a `CecNewsItem` to the `CEC_NEWS` array in `lib/content/cec-news.ts`, **newest-first** (the array already holds the featured item from Task 2 — keep it, do not duplicate). For each item:

- `id`, `sourceUrl`, `date` — copy from the raw item.
- `image` — copy the raw item's `image` (local path) if present; omit the field if the item had no image.
- `title` — `{ am, en, ru }`. Use the Armenian title from the raw item; translate to EN/RU (consult the CEC's own EN/RU page via the `SetCulture` versions where they exist for accuracy).
- `summary` — `{ am, en, ru }`. Write **1–2 neutral sentences** capturing the gist. Re-read the live page (`curl -A "<UA>" https://www.elections.am/News/Item/<id>`) for accuracy rather than relying solely on `bodyAm`. Do **not** copy the CEC text verbatim — summarise.
- `featured` — set `true` on **exactly one** item (the ratified-results item). Leave it off all others.

Keep entries sorted by `date` descending (ties: higher `id` first).

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors. (Every item must have all three locales for both `title` and `summary`, or TS will complain about the `Record<Locale, string>`.)

- [ ] **Step 4: Commit**

```bash
git add lib/content/cec-news.ts
git commit -m "content(news): trilingual summaries for 2026-cycle CEC news"
```

---

## Task 8: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: succeeds; `/[locale]/news` prerendered for am/en/ru.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Visual check**

Run: `pnpm dev`, then open:
- `http://localhost:3000/am/news`
- `http://localhost:3000/en/news`
- `http://localhost:3000/ru/news`

Confirm: hero shows the featured item with its image + "Key update" badge; grid shows the rest as image cards; items with no image show the navy/orange "ԿԸՀ" placeholder; dates render in the right locale; clicking any card opens the elections.am source in a new tab; the `News` link appears in the desktop nav and the mobile menu.

- [ ] **Step 4: Final commit (only if visual fixups were needed)**

```bash
git add -A
git commit -m "fix(news): visual polish after render check"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** static no-DB (Tasks 2–7); 2026-cycle scope + boundary confirm (Task 1 `--since`, Task 7 Step 1); all three languages (Task 7 type forces it); summary + link to source (NewsCard/Featured link to `sourceUrl`, Task 7 summaries); featured hero + grid (Tasks 4–5); image with placeholder fallback (NewsThumb); nav + i18n + sitemap (Task 6); no new deps (importer uses global `fetch`). All covered.
- **Type consistency:** `CecNewsItem` fields (`id`, `sourceUrl`, `date`, `image?`, `featured?`, `title`, `summary`) are identical across Task 2, components (Task 4), and page (Task 5). `formatNewsDate(iso, locale)` signature matches its callers. `NewsThumb` `className` prop used consistently. Message keys (`News.title/subtitle/featured/source/empty`, `Nav.news`) match page usage (`t('title')` etc.) and Header (`t('news')`).
- **Placeholders:** none — all code is complete; the only deferred work (per-item summaries) is genuine editorial content that depends on the scrape, with an exact authoring procedure and a real worked example.
```
