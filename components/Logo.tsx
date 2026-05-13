import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Official «Դիտակետ» / Ditaket mark — observation tower + orange telescope
 * with the «ԴԻՏԱԿԵՏ» wordmark and «ԴԻՏՈՐԴԱԿԱՆ ԱՌԱՔԵԼՈՒԹՅՈՒՆ» (Observer
 * Mission) subtitle baked into the image. Lives at `/public/logo.png`.
 */
export function Logo({
  className,
  size = 'md',
  showSubtitle = false,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}) {
  const dim = size === 'sm' ? 40 : size === 'lg' ? 96 : 56;
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="/logo.png"
        alt="«Դիտակետ» — Դիտորդական առաքելություն"
        width={dim}
        height={dim}
        priority
        className="h-auto w-auto"
      />
      {showSubtitle ? (
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-navy-700">
            Դիտորդական առաքելություն
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-navy-700/70">
            Observer mission · CEC-accredited
          </span>
        </span>
      ) : null}
    </div>
  );
}
