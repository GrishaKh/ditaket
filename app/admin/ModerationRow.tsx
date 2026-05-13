'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type Event = {
  id: string;
  stationId: string;
  categoryId: string | null;
  categoryLabel: string;
  ecArticle: string;
  severity: number;
  description: string;
  source: string;
  locale: string;
  createdAt: string;
  marz: string;
  community: string;
  address: string;
  stationNumber: string;
  reporterFingerprint: string;
};

export function ModerationRow({ event }: { event: Event }) {
  const [status, setStatus] = useState<
    'pending' | 'approving' | 'rejecting' | 'done' | 'error'
  >('pending');
  const [error, setError] = useState<string | null>(null);

  async function act(action: 'approve' | 'reject' | 'flag') {
    setStatus(action === 'approve' ? 'approving' : 'rejecting');
    setError(null);
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, action }),
      });
      if (!res.ok) {
        setStatus('error');
        setError(`HTTP ${res.status}`);
        return;
      }
      setStatus('done');
    } catch (e) {
      setStatus('error');
      setError(String(e));
    }
  }

  if (status === 'done') {
    return (
      <li className="opacity-50 transition-opacity">
        <Card accent="navy">
          <p className="text-sm text-navy-700">Resolved ✓</p>
        </Card>
      </li>
    );
  }

  return (
    <li>
      <Card accent="navy" className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="navy">{event.stationId}</Badge>
          <Badge tone={event.severity >= 4 ? 'orange' : 'navy'}>
            {event.categoryLabel}
          </Badge>
          <span className="text-xs text-navy-700">{event.ecArticle}</span>
          <span className="ml-auto text-xs text-navy-700">
            {new Date(event.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="text-sm text-navy-700">
          <span className="font-semibold text-navy-900">
            {event.marz} · {event.community}, №{event.stationNumber}
          </span>
          <br />
          <span className="text-navy-700">{event.address}</span>
        </div>
        {event.description ? (
          <p className="rounded-lg bg-cream/50 p-3 text-sm text-navy-900">
            {event.description}
          </p>
        ) : (
          <p className="text-xs italic text-navy-700/60">No description provided.</p>
        )}
        <div className="text-xs text-navy-700/60">
          fingerprint: <code>{event.reporterFingerprint.slice(0, 8)}…</code> ·
          source: <code>{event.source}</code> · locale: <code>{event.locale}</code>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => act('approve')}
            disabled={status === 'approving' || status === 'rejecting'}
          >
            {status === 'approving' ? 'Approving...' : 'Approve'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => act('flag')}
            disabled={status === 'approving' || status === 'rejecting'}
          >
            Flag
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => act('reject')}
            disabled={status === 'approving' || status === 'rejecting'}
          >
            {status === 'rejecting' ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
        {error ? (
          <p className="text-xs text-red-700">Error: {error}</p>
        ) : null}
      </Card>
    </li>
  );
}
