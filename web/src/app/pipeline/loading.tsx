import { Skeleton } from "@/components/ui/skeleton";

export default function PipelineLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 max-sm:pb-24" aria-label="Loading pipeline">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-64 max-w-[40vw] rounded-md" />
      </div>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-8 rounded-sm" style={{ width: `${52 + (i % 4) * 12}px` }} />)}
      </div>

      <div className="mx-auto mt-4 max-w-3xl">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-7 w-16 rounded-full" />)}
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <div className="flex items-center gap-2"><Skeleton className="size-3 rounded-full" /><Skeleton className="h-3 w-56" /></div>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-3"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div>
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/40">
          {Array.from({ length: 7 }).map((_, i) => (
            <li key={i} className="flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4">
              <Skeleton className="size-4 shrink-0 rounded-sm" />
              <Skeleton className="size-5 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="size-4 rounded-sm" />
            </li>
          ))}
        </ul>
        <Skeleton className="mt-4 h-3 w-full" />
      </div>
    </div>
  );
}
