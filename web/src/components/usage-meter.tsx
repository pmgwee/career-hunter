"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Gauge } from "lucide-react";
import { cn } from "@/lib/cn";

type Usage = { window5h: { tokens: number }; window7d: { tokens: number } };

// Soft budgets (tunable via localStorage `career-ops:usage-budget`). The bar
// colour is the "brake" signal — set these to your plan's real limits.
const DEFAULT_BUDGET = { w5: 140_000_000, w7: 1_000_000_000 };
type UsageContextValue = { data: Usage | null; cli: string | null; budget: typeof DEFAULT_BUDGET };

const UsageContext = createContext<UsageContextValue>({ data: null, cli: null, budget: DEFAULT_BUDGET });

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

function tone(pct: number): string {
  if (pct >= 85) return "bg-red-400";
  if (pct >= 60) return "bg-amber-400";
  return "bg-emerald-400";
}

export function UsageProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Usage | null>(null);
  const [cli, setCli] = useState<string | null>(null);
  const [budget, setBudget] = useState(DEFAULT_BUDGET);

  useEffect(() => {
    try {
      const cfg = localStorage.getItem("career-ops:config");
      setCli(cfg ? JSON.parse(cfg).cliId || null : null);
      const storedBudget = localStorage.getItem("career-ops:usage-budget");
      if (storedBudget) setBudget({ ...DEFAULT_BUDGET, ...JSON.parse(storedBudget) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/usage")
        .then((response) => response.json())
        .then((next) => {
          if (alive) setData(next);
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return <UsageContext.Provider value={{ data, cli, budget }}>{children}</UsageContext.Provider>;
}

export function UsageMeter() {
  const { data, cli, budget } = useContext(UsageContext);

  // The desktop sidebar and mobile drawer both render this component. The
  // provider owns the request so responsive navigation does not create two
  // identical polling loops.
  if (cli && cli !== "claude") return null;
  if (!data) return null;

  const rows = [
    { label: "5h", tokens: data.window5h?.tokens ?? 0, budget: budget.w5 },
    { label: "7d", tokens: data.window7d?.tokens ?? 0, budget: budget.w7 },
  ];

  return (
    <div className="border-t border-border pt-3">
      <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
        <Gauge className="size-3" /> Usage
      </div>
      <div className="space-y-2 px-1">
        {rows.map((row) => {
          const pct = Math.min(100, Math.round((row.tokens / row.budget) * 100));
          return (
            <div key={row.label} title={`${row.tokens.toLocaleString()} tokens in the last ${row.label}`}>
              <div className="flex items-center justify-between text-[10px] text-faint">
                <span>{row.label}</span>
                <span className="tabular-nums">
                  {fmt(row.tokens)} · {pct}%
                </span>
              </div>
              <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-surface-hover">
                <div
                  className={cn("h-full rounded-full transition-all", tone(pct))}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
