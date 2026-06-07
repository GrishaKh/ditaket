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
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
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
