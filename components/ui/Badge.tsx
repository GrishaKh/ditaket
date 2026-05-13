import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  children,
  tone = 'navy',
  dot = false,
  className,
}: {
  children: ReactNode;
  tone?: 'navy' | 'orange';
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]',
        tone === 'navy' && 'bg-navy-900 text-cream',
        tone === 'orange' && 'bg-orange text-navy-950',
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            tone === 'navy' ? 'bg-orange' : 'bg-navy-900',
          )}
        />
      )}
      {children}
    </span>
  );
}
