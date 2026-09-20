import { Skeleton } from "@/components/ui/skeleton";

export default function PortalsLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8" aria-label="Loading portals">
      <div className="flex items-center gap-3">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      <Skeleton className="mt-2 h-4 w-5/6 max-w-xl" />
      <Skeleton className="mt-3 h-3 w-64" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-surface/40 p-4">
            <Skeleton className="size-9 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
