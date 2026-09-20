import { Skeleton } from "@/components/ui/skeleton";

export default function FollowupsLoading() {
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
            {Array.from({ length: 6 }).map((_, i) => (
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
