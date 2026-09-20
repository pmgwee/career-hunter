import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:py-20" aria-label="Loading sign in">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="space-y-5">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-16 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-full" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-full" />
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        </section>
      </div>
    </main>
  );
}
