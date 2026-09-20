import { Skeleton } from "@/components/ui/skeleton";

export function PipelineTableRowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
          <td className="px-4 py-3"><Skeleton className="h-5 w-12 rounded-full" /></td>
          <td className="whitespace-nowrap px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-1.5 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </td>
          <td className="whitespace-nowrap px-4 py-3"><Skeleton className="h-4 w-20" /></td>
        </tr>
      ))}
    </>
  );
}

export function PipelinePageSkeleton() {
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
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded-sm" style={{ width: `${56 + (i % 4) * 12}px` }} />
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase tracking-wide text-faint">
            <tr>
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-4 py-2.5">
                  <Skeleton className="h-3" style={{ width: `${48 + (i % 3) * 20}px` }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <PipelineTableRowsSkeleton />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FollowupsTableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td className="px-2 py-3"><Skeleton className="size-4 rounded-sm" /></td>
          <td className="px-2.5 py-3"><div className="flex items-center gap-2.5"><Skeleton className="size-5 rounded-full" /><Skeleton className="h-4 w-24" /></div></td>
          <td className="px-2.5 py-3"><Skeleton className="h-4 w-32" /></td>
          <td className="px-2.5 py-3"><Skeleton className="h-5 w-12 rounded-full" /></td>
          <td className="px-2.5 py-3"><Skeleton className="h-5 w-20 rounded-md" /></td>
          <td className="px-2.5 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
          <td className="px-2.5 py-3"><Skeleton className="h-4 w-8" /></td>
          <td className="px-2.5 py-3"><Skeleton className="h-4 w-16" /></td>
          <td className="px-2.5 py-3"><Skeleton className="h-4 w-8" /></td>
          <td className="px-2.5 py-3"><Skeleton className="h-4 w-8" /></td>
          <td className="px-2.5 py-3"><Skeleton className="h-6 w-20 rounded-md" /></td>
          <td className="px-2.5 py-3"><Skeleton className="h-4 w-8" /></td>
        </tr>
      ))}
    </>
  );
}

export function FollowupsPageSkeleton() {
  return (
    <div className="mx-auto max-w-none px-6 py-8" aria-label="Loading follow-ups">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
          <Skeleton className="mt-3 h-3 w-full max-w-3xl" />
          <Skeleton className="mt-1 h-3 w-4/5 max-w-2xl" />
        </div>
        <Skeleton className="h-9 w-56 max-w-[35vw] rounded-md" />
      </div>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-sm" />)}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="w-8 px-2 py-2.5"><Skeleton className="h-3 w-3" /></th>
              {Array.from({ length: 10 }).map((_, i) => (
                <th key={i} className="px-2.5 py-2.5"><Skeleton className="h-3" style={{ width: `${40 + (i % 3) * 18}px` }} /></th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <FollowupsTableRowsSkeleton />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AnalyticsPageSkeleton({ tab = "progress" }: { tab?: "progress" | "search-stats" }) {
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

      <AnalyticsContentSkeleton tab={tab} />
    </div>
  );
}

export function AnalyticsContentSkeleton({ tab = "progress" }: { tab?: "progress" | "search-stats" }) {
  return tab === "progress" ? <AnalyticsProgressSkeleton /> : <AnalyticsStatsSkeleton />;
}

function AnalyticsProgressSkeleton() {
  return (
    <>
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
          <div className="mt-5 border-t border-border pt-4"><Skeleton className="h-3 w-48" /></div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <AnalyticsPanelSkeleton rows={5} />
        <AnalyticsPanelSkeleton rows={5} />
      </div>
    </>
  );
}

function AnalyticsStatsSkeleton() {
  return (
    <>
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <AnalyticsPanelSkeleton rows={4} />
        <AnalyticsPanelSkeleton rows={4} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <AnalyticsPanelSkeleton rows={5} />
        <AnalyticsPanelSkeleton rows={5} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <AnalyticsPanelSkeleton rows={4} />
        <AnalyticsPanelSkeleton rows={4} />
      </div>
      <div className="mt-5 rounded-2xl border border-border bg-surface/55 p-4 sm:p-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2 h-6 w-56" />
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-20" />)}
        </div>
        <div className="mt-6 border-t border-border pt-5"><AnalyticsPanelSkeleton rows={5} /></div>
      </div>
    </>
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
