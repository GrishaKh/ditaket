'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export function CopyValue({
  value,
  mono = false,
  className,
}: {
  value: string;
  mono?: boolean;
  className?: string;
}) {
  const t = useTranslations('Common');
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write rejected (e.g. permissions) — user can still select manually.
    }
  }

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-2', className)}>
      <span
        className={cn(
          'select-all text-navy-900',
          mono && 'font-mono tracking-tight',
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={t('copy')}
        className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-orange hover:bg-orange/10 hover:text-orange-700"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span>{copied ? t('copied') : t('copy')}</span>
      </button>
    </span>
  );
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="9"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3 11V2.5C3 1.67 3.67 1 4.5 1H10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 8.5L6.5 12L13 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
