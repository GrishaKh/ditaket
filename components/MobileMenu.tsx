'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type NavLink = { href: string; label: string };

export function MobileMenu({
  links,
  donateHref,
  donateLabel,
  languageSwitcher,
  menuLabel,
  closeLabel,
  taglineMission,
  taglineAccredited,
}: {
  links: NavLink[];
  donateHref: string;
  donateLabel: string;
  languageSwitcher: ReactNode;
  menuLabel: string;
  closeLabel: string;
  taglineMission: string;
  taglineAccredited: string;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll + move focus to close button when drawer opens.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label={menuLabel}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md text-navy-700 transition hover:bg-navy-900/5 hover:text-navy-900"
      >
        <svg
          width="22"
          height="14"
          viewBox="0 0 22 14"
          fill="none"
          aria-hidden="true"
        >
          <rect width="22" height="2" rx="1" fill="currentColor" />
          <rect y="6" width="22" height="2" rx="1" fill="currentColor" />
          <rect y="12" width="14" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-navy-950 text-cream transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% -10%, rgba(232,133,42,0.22), transparent 55%), radial-gradient(circle at 90% 110%, rgba(232,133,42,0.10), transparent 50%)',
        }}
      >
        {/* Top bar */}
        <div className="container-main flex items-center justify-between py-5">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-cream/60">
            «Դիտակետ»
          </span>
          <button
            ref={closeRef}
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md text-cream transition hover:bg-cream/10"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 3L17 17M17 3L3 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Main nav + donate CTA */}
        <nav className="container-main flex flex-1 flex-col items-stretch justify-center gap-1">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${(i + 1) * 60}ms` : '0ms' }}
              className={cn(
                'group flex items-baseline justify-between gap-4 border-b border-cream/10 py-4 transition-all duration-300 will-change-transform',
                open
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-3 opacity-0',
              )}
            >
              <span className="font-display text-3xl font-bold text-cream transition group-hover:text-orange">
                {l.label}
              </span>
              <span
                aria-hidden="true"
                className="text-2xl text-orange opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
              >
                →
              </span>
            </a>
          ))}

          <a
            href={donateHref}
            onClick={() => setOpen(false)}
            style={{
              transitionDelay: open ? `${(links.length + 1) * 60}ms` : '0ms',
            }}
            className={cn(
              'focus-ring mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-orange px-6 py-4 font-display text-xl font-bold text-navy-950 shadow-[0_0_0_4px_rgba(232,133,42,0.18)] transition-all duration-300 hover:bg-orange-300',
              open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
          >
            {donateLabel}
            <span aria-hidden="true">→</span>
          </a>
        </nav>

        {/* Footer: language + tagline */}
        <div className="container-main flex flex-col items-center gap-4 pb-10 pt-8">
          {languageSwitcher}
          <p className="px-4 text-center text-[10px] uppercase leading-relaxed tracking-[0.22em] text-cream/55">
            {taglineMission}
            <span aria-hidden="true" className="mx-2 text-orange/70">
              ·
            </span>
            {taglineAccredited}
          </p>
        </div>
      </div>
    </>
  );
}
