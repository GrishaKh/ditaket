'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ditaket] page error:', error);
  }, [error]);
  return (
    <main className="container-main flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
        500
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        Something went wrong
      </h1>
      <p className="mt-6 max-w-prose text-navy-700">
        We hit an unexpected error. Please try again — if it persists, the
        moderation team has been notified.
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-navy-700/60">
          ref: <code>{error.digest}</code>
        </p>
      ) : null}
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </main>
  );
}
