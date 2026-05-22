"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  count: number;
  ids: string[];
  onClear: () => void;
  onDone: () => void;
  showReopen: boolean;
};

type BulkStatus = "idle" | "running" | "error";

export function BulkBar({ count, ids, onClear, onDone, showReopen }: Props) {
  const [status, setStatus] = useState<BulkStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  async function run(action: "approve" | "flag" | "reject" | "reopen") {
    setStatus("running");
    setError(null);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventId: ids,
          action,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setStatus("error");
        setError(`HTTP ${res.status}`);
        return;
      }
      setStatus("idle");
      setNote("");
      setShowNote(false);
      onDone();
    } catch (e) {
      setStatus("error");
      setError(String(e));
    }
  }

  const busy = status === "running";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6">
      <div className="pointer-events-auto mx-auto max-w-3xl overflow-hidden rounded-2xl border border-navy-950/40 bg-navy-950 text-cream shadow-2xl ring-1 ring-orange/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-orange text-navy-950 font-mono text-xs font-bold">
            {count}
          </span>
          <div className="flex-1 leading-tight">
            <div className="text-sm font-semibold">
              {count} {count === 1 ? "report" : "reports"} selected
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/60">
              Bulk action applies to all
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNote((s) => !s)}
            className={cn(
              "rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
              showNote
                ? "border-orange text-orange"
                : "border-cream/20 text-cream/80 hover:border-cream",
            )}
          >
            {showNote ? "− Note" : "+ Note"}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-cream/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cream/80 hover:border-cream"
          >
            Clear
          </button>
        </div>

        {showNote ? (
          <div className="border-t border-cream/10 px-4 py-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={2}
              placeholder="Shared note applied to all selected events…"
              className="w-full rounded-md border border-cream/20 bg-navy-900 p-2 text-sm text-cream placeholder:text-cream/40 focus:border-orange focus:outline-none"
            />
            <div className="mt-1 text-right font-mono text-[10px] text-cream/50">
              {note.length}/500
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-cream/10 px-4 py-3">
          <BulkButton
            tone="primary"
            onClick={() => run("approve")}
            disabled={busy}
          >
            Approve all
          </BulkButton>
          <BulkButton
            tone="warning"
            onClick={() => run("flag")}
            disabled={busy}
          >
            Flag all
          </BulkButton>
          <BulkButton
            tone="danger"
            onClick={() => run("reject")}
            disabled={busy}
          >
            Reject all
          </BulkButton>
          {showReopen ? (
            <BulkButton
              tone="ghost"
              onClick={() => run("reopen")}
              disabled={busy}
            >
              ↩ Reopen all
            </BulkButton>
          ) : null}
          {busy ? (
            <span className="ml-auto inline-flex items-center gap-2 font-mono text-[11px] text-cream/70">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
              Working…
            </span>
          ) : null}
          {error ? (
            <span className="ml-auto font-mono text-[11px] text-orange">
              {error}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BulkButton({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone: "primary" | "warning" | "danger" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" && "bg-orange text-navy-950 hover:bg-orange-400",
        tone === "warning" &&
          "border border-orange/60 bg-orange/10 text-orange hover:bg-orange/20",
        tone === "danger" &&
          "border border-cream/30 text-cream hover:border-cream hover:bg-cream/10",
        tone === "ghost" &&
          "border border-cream/20 text-cream/80 hover:border-cream hover:text-cream",
      )}
    >
      {children}
    </button>
  );
}
