import { cn } from '@/lib/utils';

export function NewsThumb({
  src,
  className,
  eager,
}: {
  src?: string;
  className?: string;
  eager?: boolean;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-navy-950',
        className,
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle at 20% -10%, rgba(232,133,42,0.30), transparent 55%), radial-gradient(circle at 90% 120%, rgba(232,133,42,0.12), transparent 50%)',
      }}
      aria-hidden="true"
    >
      <span className="font-display text-2xl font-bold tracking-[0.18em] text-cream/80">
        ԿԸՀ
      </span>
    </div>
  );
}
