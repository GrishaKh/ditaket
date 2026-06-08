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
 *
 * NOTE on date parsing: elections.am displays dates in Armenian, e.g.
 * "8 հունիսի, 2026". The script maps Armenian month names (genitive) to
 * month numbers; this is the only deviation from the plan's DD-MM-YYYY regex
 * approach, which does not match the live HTML.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://www.elections.am';
const DEFAULT_SINCE = '2026-01-01';
const MAX_MISSES = 8; // stop after this many consecutive pre-cycle/empty items

// Armenian month names (nominative + genitive forms) → zero-padded month number
const ARMENIAN_MONTHS: Record<string, string> = {
  հունվար: '01',
  հունվարի: '01',
  փետրվար: '02',
  փետրվարի: '02',
  մարտ: '03',
  մարտի: '03',
  ապրիլ: '04',
  ապրիլի: '04',
  մայիս: '05',
  մայիսի: '05',
  հունիս: '06',
  հունիսի: '06',
  հուլիս: '07',
  հուլիսի: '07',
  օգոստոս: '08',
  օգոստոսի: '08',
  սեպտեմբեր: '09',
  սեպտեմբերի: '09',
  հոկտեմբեր: '10',
  հոկտեմբերի: '10',
  նոյեմբեր: '11',
  նոյեմբերի: '11',
  դեկտեմբեր: '12',
  դեկտեմբերի: '12',
};

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

/**
 * Parse a date string like "8 հունիսի, 2026" or "30 ապրիլ, 2026" into ISO.
 * Returns empty string if not parseable.
 */
function parseArmenianDate(raw: string): string {
  // raw = "8 հունիս, 2026" or "8 հունիսի, 2026" (after entity decoding)
  // Comma may be glued to the month word ("հունիս,") — strip it before lookup
  const m = raw.trim().match(/^(\d{1,2})\s+([^\s,]+),?\s+(\d{4})$/);
  if (!m) return '';
  const [, day, monthWord, year] = m;
  const month = ARMENIAN_MONTHS[monthWord!.toLowerCase()];
  if (!month) return '';
  return `${year}-${month}-${day!.padStart(2, '0')}`;
}

async function latestId(): Promise<number> {
  const html = await fetchHtml(`${BASE}/News`);
  const ids = [...html.matchAll(/\/News\/Item\/(\d+)/g)].map((m) => Number(m[1]));
  if (ids.length === 0) throw new Error('No /News/Item/{id} links on listing');
  return Math.max(...ids);
}

function parseItem(id: number, html: string): RawItem {
  // Title: standalone <h2> before the blog-post-single div (not inside it)
  // The page has: <h2 style="margin-top:10px">ENCODED TITLE</h2>
  const h2 = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
  const titleTag = html.match(/<title>([\s\S]*?)<\/title>/);
  const titleAm = stripTags(h2?.[1] ?? titleTag?.[1] ?? '');

  // Date: <div class="post-meta animate-onscroll"><span>DD ArmenianMonth, YYYY</span>
  // (after entity decoding)
  const metaSpan = html.match(/class="post-meta animate-onscroll"[\s\S]*?<span>([\s\S]*?)<\/span>/);
  const rawDate = metaSpan ? decodeEntities(metaSpan[1]!).trim() : '';
  const date = parseArmenianDate(rawDate);

  // Body: <div class="post-content">…</div>
  const content = html.match(
    /class="post-content"[^>]*>([\s\S]*?)(?=<div class="post-meta-track"|<\/article>|<footer|$)/,
  );
  const bodyAm = stripTags(content?.[1] ?? '')
    .replace(/\s*Կիսվել[\s\S]*$/u, '')
    .trim();

  // Image: prefer og:image meta (reliable URL), fall back to inline img in .slides
  const ogImg = html.match(
    /<meta property="og:image" content="(https?:\/\/res\.elections\.am\/images\/News\/[^"]+)"/i,
  );
  const slideImg = html.match(
    /https?:\/\/res\.elections\.am\/images\/News\/[^"'\s)]+\.(?:jpe?g|png)/i,
  );

  const rawImageSource = ogImg?.[1] ?? slideImg?.[0];
  return {
    id,
    sourceUrl: `${BASE}/News/Item/${id}`,
    date,
    titleAm,
    bodyAm,
    imageSource: rawImageSource ? decodeEntities(rawImageSource) : undefined,
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error(`--since must be YYYY-MM-DD, got: ${since}`);
  const publicDir = resolve(process.cwd(), 'public/news');
  await mkdir(publicDir, { recursive: true });
  await mkdir(resolve(process.cwd(), 'data'), { recursive: true });

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
