"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CloudUpload, Copy, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

type TokenRow = { id: string; name: string; last_used_at: string | null; revoked_at: string | null; created_at: string };

export function SyncSettings() {
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const load = useCallback(() => fetch("/api/sync/tokens").then((response) => response.json()).then((data) => setTokens(Array.isArray(data.tokens) ? data.tokens : [])).catch(() => {}), []);
  useEffect(() => { void load(); }, [load]);

  async function createToken() {
    setLoading(true);
    try {
      const response = await fetch("/api/sync/tokens", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Local career-ops" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create sync token");
      setSecret(data.token);
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(`CAREER_OPS_SYNC_TOKEN=${secret}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="mt-8 rounded-2xl border border-brand/25 bg-brand-soft/40 p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-brand/15 p-2"><CloudUpload className="size-5 text-brand" /></span>
        <div>
          <h2 className="font-medium text-foreground">Cloud workspace sync</h2>
          <p className="mt-1 text-sm leading-6 text-muted">A scoped device token keeps this laptop&apos;s tracker, pipeline, reports, and profile aligned with the same private dataset Vercel reads and updates.</p>
        </div>
      </div>
      {secret ? (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-foreground">Copy this token now—it is shown only once.</p>
          <div className="mt-3 flex gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-background px-3 py-2 font-mono text-xs text-muted">CAREER_OPS_SYNC_TOKEN={secret}</code>
            <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-surface-hover">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? "Copied" : "Copy"}</button>
          </div>
          <p className="mt-3 text-xs text-muted">Add the copied line to <code>web/.env.local</code>, then run <code>npm run sync:cloud</code> once or <code>npm run sync:watch</code> for continuous updates.</p>
        </div>
      ) : (
        <button type="button" onClick={createToken} disabled={loading} className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand-200 disabled:opacity-60">{loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}Create device token</button>
      )}
      <div className="mt-4 flex items-center gap-2 text-xs text-muted"><ShieldCheck className="size-4 text-emerald-400" />Tokens are scoped to your workspace and can be revoked without changing your login.</div>
      {tokens.some((token) => !token.revoked_at) && <p className="mt-2 text-xs text-faint">{tokens.filter((token) => !token.revoked_at).length} active device token(s){tokens.some((token) => token.last_used_at) ? " · sync has connected successfully" : ""}</p>}
    </section>
  );
}
