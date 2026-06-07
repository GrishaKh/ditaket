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
  if (!row) return Response.json({ error: 'insert_failed' }, { status: 500 });
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
