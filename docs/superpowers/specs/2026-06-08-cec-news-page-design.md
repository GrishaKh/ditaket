# CEC News Page (`/news`) — Design Spec

- **Date:** 2026-06-08 (day after election day)
- **Status:** Approved design → implementation
- **Author:** Ditaket mission (Grisha) + Claude

## Context & Goal

The Central Electoral Commission publishes news on **elections.am** (`/News`,
with individual items at `/News/Item/{id}`, sequential numeric IDs, newest ≈
2018). These cover the 2026 RA parliamentary election cycle: ballot-sample
approval, observer-mission accreditation, briefings for foreign guests, voter
guidance, election day, and the ratification of preliminary results. The
election was held **June 7, 2026**; results are in (Civil Contract 61/105). The
cycle's news is therefore a **finished, fixed corpus** — not a live stream.

Goal: a public **`/news`** page on the portal that presents the CEC's
2026-election news natively — a single beautiful, trilingual (am/en/ru),
image-forward page — so the portal is a clean, accessible record of the official
CEC communications around the election, each linking back to its source.

## Decisions Locked (from brainstorming)

1. **Static, no DB, no admin.** The corpus is historical and fixed, so the
   `/live` DB+admin machinery does not apply. Use the existing `lib/content/*.ts`
   typed-content pattern instead. All effort goes into page design.
2. **Scope:** the **2026 parliamentary election cycle** — from the decree
   scheduling the election through final/ratified results. Not the full
   elections.am news archive.
3. **Languages:** **all three (am/en/ru)**, consistent with the rest of the site.
   Armenian is the source of truth; CEC's own EN/RU versions (via `SetCulture`)
   are consulted where they exist; otherwise translated.
4. **Article depth:** **summary + link to source.** We author a concise summary
   per item (not CEC verbatim) and link each to its official `/News/Item/{id}`
   page. Avoids mirroring government content wholesale.
5. **Layout:** **featured hero + responsive card grid.** One item (the ratified
   results) as a large hero with its image; the rest as image cards below.
   Image-forward, with a uniform tinted placeholder when an item has no image.
6. **No new dependencies.** elections.am 403s default fetches but returns 200 to
   a browser User-Agent, so a plain `fetch`/`curl`-based importer suffices.

## Data Model

`lib/content/cec-news.ts`:

```ts
import type { Locale } from '@/lib/i18n/routing';

export type CecNewsItem = {
  id: number;                       // CEC item id, e.g. 2018
  sourceUrl: string;                // https://www.elections.am/News/Item/2018
  date: string;                     // ISO 'YYYY-MM-DD'
  image?: string;                   // '/news/2018.jpg' (local) | undefined → fallback
  featured?: boolean;               // exactly one item → hero
  title:   Record<Locale, string>;  // am/en/ru
  summary: Record<Locale, string>;  // am/en/ru — our concise summary
};

export const CEC_NEWS: CecNewsItem[]; // newest-first
```

- Sorted newest-first.
- Exactly one item flagged `featured: true` (default: the ratified-results item);
  page falls back to the newest item if none is flagged.
- `image` points at a file in `public/news/`; `undefined` → tinted placeholder.

## Data Acquisition

`scripts/import-cec-news.ts` (tsx, mirrors existing `scripts/import-*.ts`).
Run once, locally. Responsibilities:

1. Fetch `/News` listing + walk `/News/Item/{id}` descending from the latest,
   using a desktop browser `User-Agent` header.
2. Parse each item: title, publication date, body text, and image URL.
3. **Determine the cycle boundary** by walking IDs descending and stopping at
   the first item that predates the 2026 election cycle (the natural cutoff is
   confirmed with the user before finalizing — expected to be the scheduling
   decree through ratified results).
4. Download item images to `public/news/{id}.{ext}`.
5. Emit `data/cec-news.raw.json` (raw AM text + metadata; opportunistically the
   EN/RU `SetCulture` versions where present).

Then, **as an editorial step (Claude)**, author the concise am/en/ru summaries
from the Armenian source (using CEC's official EN/RU where available for
accuracy) and hand-finalize `lib/content/cec-news.ts`. Division of labor:
the script fetches; the human/Claude summarizes and translates.

## Page

`app/[locale]/news/page.tsx`:

- Server component, `setRequestLocale(locale)`, `getTranslations('News')`.
- Fully static — reads `CEC_NEWS` at build time, no `revalidate`.
- Splits the array into `featured` (the flagged item, else newest) and the rest.
- Renders the hero `FeaturedNewsCard`, then the grid of `NewsCard`s.
- Renders `item.title[locale]` / `item.summary[locale]`; each links to
  `item.sourceUrl`.
- Empty state if the array is ever empty.

## Components

`components/news/FeaturedNewsCard.tsx` and `components/news/NewsCard.tsx`:

- Built on the existing `Card`, navy/orange/cream palette, `font-display`.
- Image in a fixed aspect-ratio box, `object-cover`, `loading="lazy"`,
  local `/news/*` file (no remote-image config needed).
- **No-image fallback:** a tinted navy/orange placeholder panel so the grid is
  visually uniform.
- Date formatted per locale; a localized "Read on elections.am →" source link.

## Wiring

- **Nav:** add `/news` to `components/Header.tsx` and `components/MobileMenu.tsx`,
  positioned right after `live`.
- **i18n:** add `Nav.news` and a new `News` namespace (page title, subtitle,
  source-link label, empty state) to `messages/{am,en,ru}.json`.
- **Sitemap:** add the `/news` route to `app/sitemap.ts`.

## Error Handling & Testing

- **Runtime:** nothing to fail — content is static. Missing image → placeholder.
  Empty array → empty state.
- **Import script:** retries and skips on per-item fetch errors; logs what it
  captured and the chosen cycle boundary for human confirmation.
- **Verification:** `next build` succeeds, `next lint` clean, and a visual render
  check of `/am/news`, `/en/news`, `/ru/news`. No test framework exists in the
  repo, so none is fabricated.

## Out of Scope

- No admin UI, no database tables, no API routes.
- No per-item detail pages on our site (we link to elections.am).
- No automated re-scraping / scheduled refresh (the cycle is closed).
- No news outside the 2026 parliamentary election cycle.
