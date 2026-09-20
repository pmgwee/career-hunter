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
          <div key={i} className="rounded-2xl border border-border bg-surface/40 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface/40 p-5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-6 w-48" />
            <Skeleton className="mt-2 h-3 w-64 max-w-full" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((__, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
