import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({
  children,
  accent = 'navy',
  className,
}: {
  children: ReactNode;
  accent?: 'navy' | 'orange' | 'none';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-cream-50 p-6 transition-shadow',
        accent === 'navy' && 'border-navy-900/15 hover:border-navy-900/30',
        accent === 'orange' && 'border-orange/40 hover:border-orange',
        accent === 'none' && 'border-transparent',
        className,
      )}
    >
      {children}
    </div>
  );
}
