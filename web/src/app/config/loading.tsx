import { Skeleton } from "@/components/ui/skeleton";

export default function ConfigLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10" aria-label="Loading configuration">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />

      <div className="mt-8 rounded-2xl border border-border bg-surface/40 p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-80 max-w-full" />
        <Skeleton className="mt-5 h-10 w-full rounded-xl" />
      </div>

      <Skeleton className="mb-2 mt-8 h-3 w-24" />
      <div className="grid gap-2 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="mt-4 h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
        <Skeleton className="h-5 w-36" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-10 w-24 rounded-full" />
      </div>
    </div>
  );
}
