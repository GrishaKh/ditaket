import { NextRequest } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, hasDatabase, schema } from '@/lib/db/client';

const ModerateSchema = z.object({
  eventId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'flag']),
  note: z.string().max(500).optional(),
});

const ACTION_TO_STATUS = {
  approve: 'approved',
  reject: 'rejected',
  flag: 'flagged',
} as const;

// Note: this route is gated by the middleware basic-auth on /admin paths,
// but it lives under /api/. Re-check the Authorization header here.
export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return Response.json({ error: 'admin_disabled' }, { status: 503 });
  }
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

  if (!hasDatabase) {
    return Response.json({ error: 'no_db' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = ModerateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'validation', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { eventId, action, note } = parsed.data;
  const db = getDb();
  const [row] = await db
    .update(schema.events)
    .set({
      moderationStatus: ACTION_TO_STATUS[action],
      moderatorNote: note ?? null,
      moderatedAt: new Date(),
      moderatedByRole: 'admin',
    })
    .where(eq(schema.events.id, eventId))
    .returning({ id: schema.events.id, status: schema.events.moderationStatus });
  if (!row) {
    return Response.json({ error: 'not_found' }, { status: 404 });
  }
  return Response.json({ ok: true, id: row.id, status: row.status });
}
