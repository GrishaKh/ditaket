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
