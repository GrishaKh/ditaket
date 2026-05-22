"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ModerationRow } from "./ModerationRow";
import { BulkBar } from "./BulkBar";
import type {
  AdminEventRow,
  AdminFilters,
  AdminStatus,
  AdminSort,
  AdminStats,
  StatusCounts,
} from "./queries";

type CategoryOpt = {
  id: string;
  label: string;
  labelEn: string;
  severity: number;
  ecArticle: string;
};

type Props = {
  filters: AdminFilters;
  events: AdminEventRow[];
  counts: StatusCounts;
  stats: AdminStats;
  marzList: string[];
  categories: CategoryOpt[];
  sources: string[];
  loadError: string | null;
};

const STATUS_TABS: { key: AdminStatus; label: string; hint: string }[] = [
  { key: "pending", label: "Pending", hint: "Awaiting review" },
  { key: "flagged", label: "Flagged", hint: "Needs escalation" },
  { key: "approved", label: "Approved", hint: "Published" },
  { key: "rejected", label: "Rejected", hint: "Dismissed" },
  { key: "all", label: "All", hint: "Full archive" },
];

const SEVERITY_LABELS: Record<string, string> = {
  "5": "5 — Critical",
  "4": "4 — High",
  "3": "3 — Moderate",
  "2": "2 — Low",
  "1": "1 — Informational",
};

const REFRESH_OPTIONS = [
  { value: 0, label: "Off" },
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
];

export function AdminShell({
  filters,
  events,
  counts,
  stats,
  marzList,
  categories,
  sources,
  loadError,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [refreshSec, setRefreshSec] = useState(0);
  const [tick, setTick] = useState(0);
  const [clock, setClock] = useState<string>("");
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  // Persist auto-refresh choice.
  useEffect(() => {
    const stored = localStorage.getItem("admin:refreshSec");
    if (stored) setRefreshSec(Number(stored) || 0);
  }, []);

  // Live clock (Yerevan).
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Yerevan",
      });
    setClock(fmt());
    const id = setInterval(() => setClock(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-refresh: ticks every second to update countdown; calls router.refresh()
  // when the configured interval elapses.
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (refreshSec === 0) {
      setTick(0);
      return;
    }
    setTick(refreshSec);
    tickRef.current = setInterval(() => {
      setTick((t) => {
        if (t <= 1) {
          router.refresh();
          return refreshSec;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [refreshSec, router]);

  const pushFilter = useCallback(
    (key: keyof AdminFilters, value: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (!value) sp.delete(key);
      else sp.set(key, value);
      const qs = sp.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
      setSelected(new Set());
    },
    [router, pathname, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
    setSelected(new Set());
  }, [router, pathname]);

  const setRefresh = useCallback((sec: number) => {
    setRefreshSec(sec);
    localStorage.setItem("admin:refreshSec", String(sec));
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelected(new Set(events.map((e) => e.id)));
  }, [events]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const onActionDone = useCallback(() => {
    setSelected(new Set());
    router.refresh();
  }, [router]);

  const activeFilters = useMemo(() => {
    const items: string[] = [];
    if (filters.category) items.push(`category:${filters.category}`);
    if (filters.marz) items.push(`marz:${filters.marz}`);
    if (filters.severity) items.push(`severity:${filters.severity}`);
    if (filters.source) items.push(`source:${filters.source}`);
    if (filters.q) items.push(`q:"${filters.q}"`);
    if (filters.sort !== "newest") items.push(`sort:${filters.sort}`);
    return items;
  }, [filters]);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* TOP STRIPE — navy-950 ops band */}
      <header className="sticky top-0 z-40 border-b border-navy-900/30 bg-navy-950 text-cream">
        <div className="mx-auto flex h-14 max-w-[1680px] items-center gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-orange text-navy-950">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18M3 12h18" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-tight">
                Ditaket · Ops
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/60">
                Moderation console
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-6 font-mono text-[11px] tracking-tight text-cream/80">
            <span className="hidden items-center gap-2 md:inline-flex">
              <span className="relative grid h-2 w-2 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-orange/70" />
                <span className="relative h-2 w-2 rounded-full bg-orange" />
              </span>
              LIVE · Yerevan {clock}
            </span>
            <span className="hidden sm:inline">
              Election day · <span className="text-cream">7 Jun 2026</span>
            </span>
            <a
              href="/api/events"
              className="rounded border border-cream/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cream/80 transition-colors hover:border-orange hover:text-orange"
            >
              /api/events ↗
            </a>
            <a
              href="/"
              className="text-[10px] uppercase tracking-[0.18em] text-cream/60 hover:text-orange"
            >
              Exit ↗
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1680px] gap-0 lg:gap-6 px-0 sm:px-4 lg:px-6">
        {/* LEFT — status nav */}
        <aside className="hidden w-60 shrink-0 border-r border-navy-900/10 py-8 lg:block">
          <div className="sticky top-20 space-y-1 pr-2">
            <div className="px-3 pb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-navy-700/70">
              Status
            </div>
            {STATUS_TABS.map((t) => {
              const n = counts[t.key];
              const active = filters.status === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => pushFilter("status", t.key)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                    active
                      ? "border-navy-900 bg-navy-900 text-cream"
                      : "border-transparent text-navy-900 hover:border-navy-900/15 hover:bg-cream",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      t.key === "pending" && "bg-orange",
                      t.key === "flagged" && "bg-orange-700",
                      t.key === "approved" && "bg-emerald-600",
                      t.key === "rejected" && "bg-navy-700",
                      t.key === "all" && "bg-navy-900/40",
                    )}
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{t.label}</span>
                    <span
                      className={cn(
                        "block text-[10px] uppercase tracking-[0.18em]",
                        active ? "text-cream/60" : "text-navy-700/60",
                      )}
                    >
                      {t.hint}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-mono text-sm tabular-nums",
                      active ? "text-cream" : "text-navy-700",
                      t.key === "pending" && n > 0 && !active && "text-orange-700",
                    )}
                  >
                    {n}
                  </span>
                </button>
              );
            })}

            <div className="mt-8 px-3 pb-3 pt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-navy-700/70">
              Auto-refresh
            </div>
            <div className="flex flex-wrap gap-1 px-1">
              {REFRESH_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setRefresh(o.value)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors",
                    refreshSec === o.value
                      ? "border-orange bg-orange text-navy-950"
                      : "border-navy-900/15 text-navy-700 hover:border-navy-900/40",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {refreshSec > 0 ? (
              <div className="mt-2 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-navy-700/60">
                Next refresh in {tick}s
              </div>
            ) : null}

            <div className="mt-8 rounded-xl border border-navy-900/10 bg-cream p-3 text-[11px] leading-relaxed text-navy-700">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-navy-700/70">
                Keyboard
              </div>
              <kbd className="rounded border border-navy-900/20 bg-cream-50 px-1.5 py-0.5 font-mono text-[10px]">
                A
              </kbd>{" "}
              approve ·{" "}
              <kbd className="rounded border border-navy-900/20 bg-cream-50 px-1.5 py-0.5 font-mono text-[10px]">
                F
              </kbd>{" "}
              flag ·{" "}
              <kbd className="rounded border border-navy-900/20 bg-cream-50 px-1.5 py-0.5 font-mono text-[10px]">
                R
              </kbd>{" "}
              reject ·{" "}
              <kbd className="rounded border border-navy-900/20 bg-cream-50 px-1.5 py-0.5 font-mono text-[10px]">
                /
              </kbd>{" "}
              search
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-2 lg:px-0">
          {/* Stats tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              label="Reports today"
              value={stats.todayTotal}
              accent="navy"
            />
            <StatTile
              label="High severity"
              value={stats.todayHighSeverity}
              accent={stats.todayHighSeverity > 0 ? "orange" : "navy"}
              caption="sev ≥ 4 today"
            />
            <StatTile
              label="Past 1h"
              value={stats.past1h}
              accent="navy"
              caption="rolling window"
            />
            <StatTile
              label="With GPS"
              value={stats.withGps}
              caption={`${stats.todayTotal > 0 ? Math.round((stats.withGps / stats.todayTotal) * 100) : 0}% of today`}
              accent="navy"
            />
          </div>

          {/* MOBILE status tabs */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {STATUS_TABS.map((t) => {
              const active = filters.status === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => pushFilter("status", t.key)}
                  className={cn(
                    "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold",
                    active
                      ? "border-navy-900 bg-navy-900 text-cream"
                      : "border-navy-900/15 bg-cream text-navy-900",
                  )}
                >
                  {t.label}{" "}
                  <span className="font-mono opacity-70">
                    {counts[t.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter bar */}
          <div className="mt-6 rounded-xl border border-navy-900/15 bg-cream p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[240px]">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-navy-700/60">
                  ⌕
                </span>
                <input
                  type="search"
                  defaultValue={filters.q}
                  placeholder="Search station, address, description…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      pushFilter("q", (e.target as HTMLInputElement).value);
                    }
                  }}
                  className="w-full rounded-lg border border-navy-900/15 bg-cream-50 py-2 pl-8 pr-3 text-sm text-navy-900 placeholder:text-navy-700/50 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-orange/40"
                  data-admin-search
                />
              </div>

              <Select
                value={filters.marz}
                onChange={(v) => pushFilter("marz", v)}
                placeholder="All marz"
                options={marzList.map((m) => ({ value: m, label: m }))}
              />
              <Select
                value={filters.category}
                onChange={(v) => pushFilter("category", v)}
                placeholder="All categories"
                options={categories.map((c) => ({
                  value: c.id,
                  label: `${c.label}`,
                }))}
              />
              <Select
                value={filters.severity}
                onChange={(v) => pushFilter("severity", v)}
                placeholder="Any severity"
                options={["5", "4", "3", "2", "1"].map((s) => ({
                  value: s,
                  label: SEVERITY_LABELS[s] ?? `Sev ${s}`,
                }))}
              />
              <Select
                value={filters.source}
                onChange={(v) => pushFilter("source", v)}
                placeholder="All sources"
                options={sources.map((s) => ({ value: s, label: s }))}
              />
              <Select
                value={filters.sort}
                onChange={(v) => pushFilter("sort", v)}
                placeholder="Sort"
                options={[
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                  { value: "severity", label: "Severity ↓" },
                ]}
                hideClear
              />

              {activeFilters.length > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg border border-navy-900/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-navy-700 hover:border-orange hover:text-orange"
                >
                  Clear {activeFilters.length}
                </button>
              ) : null}

              {events.length > 0 ? (
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="ml-auto rounded-lg border border-navy-900/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-navy-700 hover:border-navy-900 hover:text-navy-900"
                >
                  Select all ({events.length})
                </button>
              ) : null}
            </div>

            {activeFilters.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-navy-900/10 pt-3">
                {activeFilters.map((f) => (
                  <span
                    key={f}
                    className="rounded-md bg-navy-900/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-navy-700"
                  >
                    {f}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Section header */}
          <div className="mt-8 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold text-navy-900">
              {STATUS_TABS.find((t) => t.key === filters.status)?.label ??
                "Reports"}
            </h2>
            <span className="font-mono text-xs text-navy-700/70">
              showing {events.length} of {counts[filters.status]}
            </span>
          </div>

          {/* Body */}
          {loadError ? (
            <div className="mt-6 rounded-xl border border-orange/40 bg-orange/5 p-5 text-sm text-navy-900">
              {loadError}
            </div>
          ) : events.length === 0 ? (
            <EmptyState status={filters.status} hasFilters={activeFilters.length > 0} />
          ) : (
            <ul className="mt-6 space-y-3" data-admin-list>
              {events.map((ev) => (
                <ModerationRow
                  key={ev.id}
                  event={ev}
                  selected={selected.has(ev.id)}
                  onToggleSelect={() => toggleSelect(ev.id)}
                  onActionDone={onActionDone}
                />
              ))}
            </ul>
          )}
        </main>
      </div>

      {selected.size > 0 ? (
        <BulkBar
          count={selected.size}
          ids={Array.from(selected)}
          onClear={clearSelection}
          onDone={onActionDone}
          showReopen={filters.status !== "pending"}
        />
      ) : null}
    </div>
  );
}

function StatTile({
  label,
  value,
  caption,
  accent = "navy",
}: {
  label: string;
  value: number;
  caption?: string;
  accent?: "navy" | "orange";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-cream p-4",
        accent === "orange" ? "border-orange/60" : "border-navy-900/15",
      )}
    >
      {accent === "orange" ? (
        <span className="absolute inset-y-0 left-0 w-1 bg-orange" />
      ) : null}
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-navy-700/70">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-display text-3xl font-bold tabular-nums",
          accent === "orange" ? "text-orange-700" : "text-navy-900",
        )}
      >
        {value}
      </div>
      {caption ? (
        <div className="mt-1 text-[11px] text-navy-700/70">{caption}</div>
      ) : null}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  hideClear = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  hideClear?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 appearance-none rounded-lg border bg-cream-50 py-1.5 pl-3 pr-8 text-sm transition-colors focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-orange/40",
          value
            ? "border-navy-900 text-navy-900"
            : "border-navy-900/15 text-navy-700",
        )}
      >
        {!hideClear ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-navy-700">
        ▾
      </span>
    </div>
  );
}

function EmptyState({
  status,
  hasFilters,
}: {
  status: AdminStatus;
  hasFilters: boolean;
}) {
  return (
    <div className="mt-12 rounded-2xl border border-dashed border-navy-900/20 bg-cream p-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-navy-900/15 text-navy-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="mt-4 font-display text-lg text-navy-900">
        {status === "pending"
          ? "Queue clear"
          : hasFilters
            ? "No matches"
            : `No ${status} reports`}
      </p>
      <p className="mt-1 text-sm text-navy-700">
        {hasFilters
          ? "Try removing or relaxing filters."
          : status === "pending"
            ? "Nothing waiting for review right now."
            : "Nothing here yet."}
      </p>
    </div>
  );
}
