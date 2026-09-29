"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { CANONICAL_STATES, statusDot } from "@/lib/format";
import { cn } from "@/lib/cn";

// Status writeback control. Updates the existing tracker row (status cell) via
// /api/status — never adds rows. Reverts on failure; confirms with the
// terminal-popup animation.
export function StatusSelect({
  n,
  current,
  inline = false,
  applicationLabel,
  onSaved,
}: {
  n: string;
  current: string;
  inline?: boolean;
  applicationLabel?: string;
  onSaved?: (status: string) => void;
}) {
  const [status, setStatus] = useState(current);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    setStatus(current);
  }, [current]);

  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
  }, []);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const prev = status;
    if (next === prev) return;
    setStatus(next);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n, status: next }),
      });
      if (!res.ok) throw new Error("Could not save status. Please try again.");
      onSaved?.(next);
      if (inline) setEditing(false);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (cause) {
      setStatus(prev); // revert on failure
      setError(cause instanceof Error ? cause.message : "Could not save status. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const known = (CANONICAL_STATES as readonly string[]).includes(status);
  const control = (
    <select
      autoFocus={inline}
      id={inline ? undefined : `status-${n}`}
      aria-label={inline ? `Status for ${applicationLabel ?? `application #${n}`}` : undefined}
      value={status}
      onChange={onChange}
      onKeyDown={(event) => {
        if (inline && event.key === "Escape" && !busy) {
          setEditing(false);
          setError("");
        }
      }}
      disabled={busy}
      className="rounded-md border border-border bg-surface px-2.5 py-1 text-sm text-foreground outline-none transition-colors focus:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 max-sm:min-h-[44px]"
    >
      {!known && <option value={status}>{status}</option>}
      {CANONICAL_STATES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );

  return (
    <span className="inline-flex items-center gap-2">
      {inline ? editing ? (
        <>
          {control}
          <button
            type="button"
            aria-label={`Cancel editing status for ${applicationLabel ?? `application #${n}`}`}
            title="Cancel"
            onClick={() => { setEditing(false); setError(""); }}
            disabled={busy}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50 max-sm:size-11"
          >
            <X className="size-3.5" />
          </button>
        </>
      ) : (
        <>
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("size-1.5 shrink-0 rounded-full", statusDot(status))} />
            {status}
          </span>
          <button
            type="button"
            aria-label={`Edit status for ${applicationLabel ?? `application #${n}`}`}
            title="Edit status"
            onClick={() => { setError(""); setEditing(true); }}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-brand focus-visible:outline-2 focus-visible:outline-brand max-sm:size-11"
          >
            <Pencil className="size-4" />
          </button>
        </>
      ) : (
        <>
          <label htmlFor={`status-${n}`} className="text-xs text-faint">status</label>
          {control}
        </>
      )}
      {saved && (
        <span role="status" className="animate-terminal-popup inline-flex items-center gap-1 text-xs font-medium text-brand">
          <Check className="size-3" /> saved
        </span>
      )}
      {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
