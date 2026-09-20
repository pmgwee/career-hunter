import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 max-sm:pb-24" aria-label="Loading analytics">
      <header className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-4 w-36" />
      </header>

      <div className="mt-5 flex gap-2 border-b border-border pb-0">
        <Skeleton className="h-11 w-36 rounded-t-lg" />
        <Skeleton className="h-11 w-32 rounded-t-lg" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/45 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-9 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <AnalyticsPanelSkeleton rows={5} />
        <div className="rounded-2xl border border-border bg-surface/55 p-4 sm:p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-6 w-44" />
          <Skeleton className="mt-2 h-3 w-full max-w-xs" />
          <div className="mt-5 divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-14" />
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <AnalyticsPanelSkeleton rows={5} />
        <AnalyticsPanelSkeleton rows={5} />
      </div>
    </div>
  );
}

function AnalyticsPanelSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/55 p-4 sm:p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-6 w-48" />
      <Skeleton className="mt-2 h-3 w-64 max-w-full" />
      <div className="mt-5 space-y-3.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-[minmax(94px,0.45fr)_minmax(80px,1fr)_auto] items-center gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
