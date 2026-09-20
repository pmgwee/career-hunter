import { Skeleton } from "@/components/ui/skeleton";

export default function ApplyLoading() {
  return (
    <div className="relative min-h-screen" aria-label="Loading application assistant">
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center gap-3">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-5/6 max-w-xl" />

        <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-3 w-72 max-w-full" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-6 h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}
