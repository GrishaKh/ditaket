'use client';
import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from '@/lib/i18n/routing';

export function SearchBar({
  placeholder,
  action,
}: {
  placeholder: string;
  action: string;
}) {
  const [q, setQ] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed || isPending) return;
    startTransition(() => {
      router.push(`/marz?q=${encodeURIComponent(trimmed)}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-busy={isPending}
      className="flex w-full items-stretch overflow-hidden rounded-xl bg-cream-50 ring-2 ring-navy-900 transition-shadow focus-within:ring-orange"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent px-5 py-4 text-base text-navy-900 placeholder:text-navy-700/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 bg-navy-900 px-6 text-sm font-semibold uppercase tracking-widest text-cream transition-colors hover:bg-navy-700 disabled:cursor-wait disabled:hover:bg-navy-900"
      >
        {isPending ? (
          <>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 animate-spin"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeOpacity="0.25"
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                d="M22 12a10 10 0 0 1-10 10"
              />
            </svg>
            <span>{action}</span>
          </>
        ) : (
          action
        )}
      </button>
    </form>
  );
}
