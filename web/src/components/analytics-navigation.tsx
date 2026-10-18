"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Sparkles, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { startRouteProgress } from "@/components/route-progress";

type View = "progress" | "insights" | "search-stats";
const TABS = [
  { view: "progress", href: "/analytics", label: "Search progress", icon: BarChart3 },
  { view: "insights", href: "/analytics?view=insights", label: "Insights", icon: Sparkles },
  { view: "search-stats", href: "/analytics?view=search-stats", label: "Search stats", icon: Target },
] as const;

// Only the navigation/content boundary is client-side. The unchanged header
// and the server-rendered metric panels stay outside the client module graph.
export function AnalyticsNavigation({ view, children }: { view: View; children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [destination, setDestination] = useState<View>(view);
  const active = pending ? destination : view;
  const label = TABS.find((tab) => tab.view === active)!.label;
  return (
    <>
      <nav aria-label="Analytics views" className="mt-5 -mb-px flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map(({ view: next, href, label: text, icon: Icon }) => (
          <Link
            key={next}
            href={href}
            aria-current={active === next ? "page" : undefined}
            onNavigate={(event) => {
              event.preventDefault();
              if (active === next && !pending) return;
              setDestination(next);
              startRouteProgress();
              startTransition(() => router.push(href, { scroll: false }));
            }}
            className={`-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-xs font-semibold transition-colors ${
              active === next ? "border-brand text-foreground" : "border-transparent text-muted hover:border-border hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {text}
          </Link>
        ))}
      </nav>
      {pending ? <AnalyticsContentSkeleton view={active} label={label} /> : children}
    </>
  );
}

function AnalyticsContentSkeleton({ view, label }: { view: View; label: string }) {
  return (
    <section className="mt-6 space-y-5" role="status" aria-label={`Loading ${label}`} aria-busy="true">
      <span className="sr-only">Loading {label}</span>
      {view === "progress" && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-xl border border-border bg-surface/50 p-5">
              <Skeleton className="h-3 w-24" /><Skeleton className="mt-3 h-8 w-16" />
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]" aria-hidden="true">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-border bg-surface/40 p-5">
            <Skeleton className="h-5 w-44" /><Skeleton className="mt-2 h-3 w-60 max-w-full" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 5 }, (_, row) => <Skeleton key={row} className="h-5 w-full" />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
