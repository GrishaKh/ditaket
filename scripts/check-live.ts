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
