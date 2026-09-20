import { Skeleton } from "@/components/ui/skeleton";

export default function FollowupsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 max-sm:pb-24" aria-label="Loading follow-ups">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface/40 p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-4">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
        </div>
        <div className="mt-5 divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-4">
              <Skeleton className="size-9 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="hidden h-8 w-24 rounded-full sm:block" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
