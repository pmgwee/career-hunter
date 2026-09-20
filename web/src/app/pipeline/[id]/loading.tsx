import { Skeleton } from "@/components/ui/skeleton";

export default function ReportLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 max-sm:pb-24" aria-label="Loading report">
      <Skeleton className="h-4 w-28" />
      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-6">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-3 h-9 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
        <div className="mt-5 flex gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-6">
        <Skeleton className="h-4 w-44" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`mt-4 h-4 ${i % 3 === 0 ? "w-4/5" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}
