'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from '@/lib/i18n/routing';

export function SearchBar({
  placeholder,
  action,
}: {
  placeholder: string;
  action: string;
}) {
  const [q, setQ] = useState('');
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/marz?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
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
        className="focus-ring shrink-0 bg-navy-900 px-6 text-sm font-semibold uppercase tracking-widest text-cream transition-colors hover:bg-navy-700"
      >
        {action}
      </button>
    </form>
  );
}
