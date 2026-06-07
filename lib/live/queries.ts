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
