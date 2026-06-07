'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Re-runs the server component on an interval so ISR-cached content stays fresh
 * without a manual reload. The interval is established in useEffect (client
 * only) — never bound to a render-time environment check.
 */
export function AutoRefresh({ intervalMs = 30000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      try {
        router.refresh();
      } catch {
        // no-op: never let a refresh failure break the page
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
