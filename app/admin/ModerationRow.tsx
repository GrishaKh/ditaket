"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { AdminEventRow } from "./queries";

type Props = {
  event: AdminEventRow;
  selected: boolean;
  onToggleSelect: () => void;
  onActionDone: () => void;
};

type LocalStatus =
  | "idle"
  | "approving"
  | "rejecting"
  | "flagging"
  | "reopening"
  | "done"
  | "error";

type PillSpec = { label: string; bg: string; fg: string; dot: string };

const STATUS_PILL: Record<
  "pending" | "flagged" | "approved" | "rejected",
  PillSpec
> = {
  pending: {
    label: "Pending",
    bg: "bg-orange/15",
    fg: "text-orange-700",
    dot: "bg-orange",
  },
  flagged: {
    label: "Flagged",
    bg: "bg-orange-700/15",
    fg: "text-orange-800",
    dot: "bg-orange-700",
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-600/10",
    fg: "text-emerald-700",
    dot: "bg-emerald-600",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-navy-900/10",
    fg: "text-navy-700",
    dot: "bg-navy-700",
  },
};

function pillFor(status: string): PillSpec {
  if (status === "pending" || status === "flagged" || status === "approved" || status === "rejected") {
    return STATUS_PILL[status];
  }
  return STATUS_PILL.pending;
}

const SEVERITY_COLOR = [
  "bg-navy-900/15", // 0
  "bg-navy-700", // 1
  "bg-cream-500", // 2
  "bg-orange-300", // 3
  "bg-orange", // 4
  "bg-orange-700", // 5
];

const SEVERITY_LABEL = ["—", "INFO", "LOW", "MED", "HIGH", "CRIT"];

export function ModerationRow({
  event,
  selected,
  onToggleSelect,
  onActionDone,
}: Props) {
  const [status, setStatus] = useState<LocalStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const busy =
    status === "approving" ||
    status === "rejecting" ||
    status === "flagging" ||
    status === "reopening";

  const act = useCallback(
    async (action: "approve" | "reject" | "flag" | "reopen") => {
      const localMap: Record<typeof action, LocalStatus> = {
        approve: "approving",
        reject: "rejecting",
        flag: "flagging",
        reopen: "reopening",
      };
      setStatus(localMap[action]);
      setError(null);
      try {
        const res = await fetch("/api/admin/moderate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            action,
            note: note.trim() || undefined,
          }),
        });
        if (!res.ok) {
          setStatus("error");
          setError(`HTTP ${res.status}`);
          return;
        }
        setStatus("done");
        // Let the brief 'Resolved' state show, then refresh.
        setTimeout(onActionDone, 350);
      } catch (e) {
        setStatus("error");
        setError(String(e));
      }
    },
    [event.id, note, onActionDone],
  );

  // Keyboard shortcuts when this card has focus-within
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.contains(document.activeElement)) return;
      const target = document.activeElement as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      if (busy) return;
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        act("approve");
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        act("flag");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        act("reject");
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setShowNote((s) => !s);
      } else if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        onToggleSelect();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act, busy, onToggleSelect]);

  if (status === "done") {
    return (
      <li className="overflow-hidden rounded-xl border border-emerald-600/40 bg-emerald-600/5 px-5 py-3 text-sm text-emerald-700 transition-opacity">
        Resolved ✓
      </li>
    );
  }

  const pill = pillFor(event.moderationStatus);
  const sev = Math.max(0, Math.min(5, event.severity));
  const isPending = event.moderationStatus === "pending";
  const moderatedAt = event.moderatedAt
    ? new Date(event.moderatedAt)
    : null;

  return (
    <li
      ref={rootRef}
      className={cn(
        "group relative grid grid-cols-[6px_28px_1fr] overflow-hidden rounded-xl border bg-cream transition-shadow focus-within:shadow-lg",
        selected
          ? "border-navy-900 ring-2 ring-orange/40"
          : "border-navy-900/15 hover:border-navy-900/30",
      )}
    >
      {/* Severity rail */}
      <div
        className={cn("h-full", SEVERITY_COLOR[sev])}
        aria-label={`Severity ${sev}`}
      />

      {/* Select column */}
      <div className="flex items-start justify-center pt-5">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="h-4 w-4 cursor-pointer rounded border-navy-900/30 text-orange focus:ring-orange/40"
          aria-label="Select for bulk action"
        />
      </div>

      {/* Body */}
      <div className="min-w-0 p-5">
        {/* Top meta line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]",
              pill.bg,
              pill.fg,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", pill.dot)} />
            {pill.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
              sev >= 4
                ? "border-orange/60 text-orange-700"
                : "border-navy-900/15 text-navy-700",
            )}
            title={`Severity ${sev} of 5`}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", SEVERITY_COLOR[sev])} />
            SEV {sev} · {SEVERITY_LABEL[sev]}
          </span>
          <span className="font-mono text-navy-700">
            {event.stationId}
            <span className="text-navy-700/40"> · </span>
            <span className="text-navy-700/80">№{event.stationNumber}</span>
          </span>
          <span className="text-navy-700/40">·</span>
          <span className="font-mono text-navy-700">{event.ecArticle}</span>

          <span className="ml-auto flex items-center gap-2 font-mono text-navy-700/70">
            {event.fingerprintCount > 1 ? (
              <span
                className="rounded bg-orange-700/10 px-1.5 py-0.5 text-orange-800"
                title="Total reports from this fingerprint (across all stations)"
              >
                ×{event.fingerprintCount} fp
              </span>
            ) : null}
            {event.stationCount > 1 ? (
              <span
                className="rounded bg-navy-900/10 px-1.5 py-0.5 text-navy-700"
                title="Total reports against this station"
              >
                ×{event.stationCount} station
              </span>
            ) : null}
            <time
              dateTime={event.createdAt}
              title={new Date(event.createdAt).toISOString()}
            >
              {timeAgo(event.createdAt)}
            </time>
          </span>
        </div>

        {/* Title row */}
        <div className="mt-3 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-base font-semibold leading-snug text-navy-900">
            {event.categoryLabel}
          </h3>
        </div>

        {/* Where */}
        <div className="mt-1 text-sm text-navy-700">
          <span className="font-semibold text-navy-900">{event.marz}</span>
          {event.community ? <> · {event.community}</> : null}
          {event.address ? (
            <>
              <span className="text-navy-700/40"> · </span>
              <span>{event.address}</span>
            </>
          ) : null}
        </div>

        {/* Description */}
        {event.description ? (
          <p className="mt-3 whitespace-pre-wrap rounded-lg border-l-2 border-navy-900/15 bg-cream-50 px-3 py-2 text-sm leading-relaxed text-navy-900">
            {event.description}
          </p>
        ) : (
          <p className="mt-3 text-xs italic text-navy-700/50">
            No description provided.
          </p>
        )}

        {/* Reporter GPS */}
        {event.reporterLat != null && event.reporterLng != null ? (
          <div className="mt-3 rounded-lg border border-navy-900/10 bg-cream-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-navy-700/70">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3 w-3"
                >
                  <path d="M12 22s8-7.58 8-13a8 8 0 10-16 0c0 5.42 8 13 8 13z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                Reporter location
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-navy-700">
                <code>
                  {event.reporterLat.toFixed(5)},{" "}
                  {event.reporterLng.toFixed(5)}
                </code>
                {event.reporterAccuracyM != null ? (
                  <span className="text-navy-700/60">
                    ±{Math.round(event.reporterAccuracyM)}m
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowMap((m) => !m)}
                  className="rounded border border-navy-900/15 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] hover:border-orange hover:text-orange"
                >
                  {showMap ? "Hide map" : "Show map"}
                </button>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${event.reporterLat}&mlon=${event.reporterLng}#map=18/${event.reporterLat}/${event.reporterLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-700 underline-offset-2 hover:text-orange hover:underline"
                >
                  OSM ↗
                </a>
                <a
                  href={`https://www.google.com/maps?q=${event.reporterLat},${event.reporterLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-700 underline-offset-2 hover:text-orange hover:underline"
                >
                  Google ↗
                </a>
              </div>
            </div>
            {showMap ? (
              <div className="mt-3 overflow-hidden rounded-md border border-navy-900/10">
                <iframe
                  title="Reporter location"
                  width="100%"
                  height="240"
                  loading="lazy"
                  src={osmEmbed(
                    event.reporterLat,
                    event.reporterLng,
                  )}
                  className="block"
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 text-[11px] italic text-navy-700/50">
            Reporter location: not shared
          </div>
        )}

        {/* Existing moderator note (if any) */}
        {event.moderatorNote ? (
          <div className="mt-3 rounded-lg border border-navy-900/15 bg-navy-900/[0.03] p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-700/70">
              Moderator note
              {moderatedAt ? (
                <span className="ml-2 text-navy-700/50">
                  · {moderatedAt.toLocaleString()}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-navy-900">
              {event.moderatorNote}
            </p>
          </div>
        ) : null}

        {/* Fingerprint / source / locale strip */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-navy-700/60">
          <span>
            fp <code className="text-navy-700">{event.reporterFingerprint.slice(0, 12)}…</code>
          </span>
          <span>
            src <code className="text-navy-700">{event.source}</code>
          </span>
          <span>
            locale <code className="text-navy-700">{event.locale}</code>
          </span>
          <span>
            id <code className="text-navy-700">{event.id.slice(0, 8)}</code>
          </span>
        </div>

        {/* Inline note input */}
        {showNote ? (
          <div className="mt-3">
            <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-navy-700/70">
              Moderator note (optional · max 500 chars)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={2}
              placeholder="Reason for action — visible internally only."
              className="mt-1 w-full rounded-lg border border-navy-900/15 bg-cream-50 p-2 text-sm text-navy-900 placeholder:text-navy-700/40 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-orange/40"
            />
            <div className="mt-1 text-right font-mono text-[10px] text-navy-700/50">
              {note.length}/500
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {isPending ? (
            <>
              <ActionButton
                tone="primary"
                busy={status === "approving"}
                onClick={() => act("approve")}
                disabled={busy}
                kbd="A"
              >
                Approve
              </ActionButton>
              <ActionButton
                tone="warning"
                busy={status === "flagging"}
                onClick={() => act("flag")}
                disabled={busy}
                kbd="F"
              >
                Flag
              </ActionButton>
              <ActionButton
                tone="ghost"
                busy={status === "rejecting"}
                onClick={() => act("reject")}
                disabled={busy}
                kbd="R"
              >
                Reject
              </ActionButton>
            </>
          ) : (
            <ActionButton
              tone="ghost"
              busy={status === "reopening"}
              onClick={() => act("reopen")}
              disabled={busy}
            >
              ↩ Reopen
            </ActionButton>
          )}

          <button
            type="button"
            onClick={() => setShowNote((s) => !s)}
            className={cn(
              "ml-auto rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
              showNote
                ? "border-orange text-orange-700"
                : "border-navy-900/15 text-navy-700 hover:border-navy-900/40",
            )}
            aria-pressed={showNote}
          >
            {showNote ? "− Note" : "+ Note"}
          </button>
        </div>

        {error ? (
          <p className="mt-2 rounded-md bg-red-50 px-2 py-1 font-mono text-[11px] text-red-700">
            Error: {error}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  busy,
  tone,
  kbd,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  tone: "primary" | "warning" | "ghost";
  kbd?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" &&
          "bg-navy-900 text-cream hover:bg-navy-950",
        tone === "warning" &&
          "border border-orange/60 bg-orange/10 text-orange-800 hover:bg-orange hover:text-navy-950",
        tone === "ghost" &&
          "border border-navy-900/15 text-navy-700 hover:border-navy-900 hover:text-navy-900",
      )}
    >
      {busy ? (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      <span>{children}</span>
      {kbd ? (
        <kbd className="rounded border border-current/30 px-1 font-mono text-[10px] opacity-70">
          {kbd}
        </kbd>
      ) : null}
    </button>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function osmEmbed(lat: number, lng: number): string {
  const d = 0.004;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}
