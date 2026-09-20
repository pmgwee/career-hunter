import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 max-sm:pb-24" aria-label="Loading job discovery">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-surface/40 p-4 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
      <div className="mt-5 flex gap-2 overflow-hidden border-b border-border pb-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface/40 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <Skeleton className="mt-5 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
            <div className="mt-5 flex items-center justify-between">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
