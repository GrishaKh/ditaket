import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props<T extends ElementType> = {
  as?: T;
  active?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'className' | 'children'>;

export function Pill<T extends ElementType = 'span'>({
  as,
  active = false,
  className,
  children,
  ...rest
}: Props<T>) {
  const Component = (as ?? 'span') as ElementType;
  return (
    <Component
      className={cn(
        'focus-ring inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-navy-900 bg-navy-900 text-cream'
          : 'border-navy-900/40 bg-cream text-navy-900 hover:border-navy-900 hover:bg-navy-900/5',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
