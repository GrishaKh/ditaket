import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'className' | 'children'>;

export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: Props<T>) {
  const Component = (as ?? 'button') as ElementType;
  return (
    <Component
      className={cn(
        'focus-ring inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-6 py-3 text-base',
        size === 'lg' && 'px-8 py-4 text-lg',
        variant === 'primary' && 'bg-orange text-navy-950 hover:bg-orange-600',
        variant === 'secondary' &&
          'border-2 border-navy-900 bg-transparent text-navy-900 hover:bg-navy-900 hover:text-cream',
        variant === 'ghost' && 'text-navy-700 hover:text-navy-900',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
