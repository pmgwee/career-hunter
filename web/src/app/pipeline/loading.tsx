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
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded-sm" style={{ width: `${56 + (i % 4) * 12}px` }} />
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase tracking-wide text-faint">
            <tr>
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-4 py-2.5"><Skeleton className="h-3" style={{ width: `${48 + (i % 3) * 20}px` }} /></th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Skeleton className="size-5 rounded-full" /><Skeleton className="h-4 w-28" /></div></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                <td className="px-4 py-3"><Skeleton className="h-5 w-12 rounded-full" /></td>
                <td className="whitespace-nowrap px-4 py-3"><div className="flex items-center gap-1.5"><Skeleton className="size-1.5 rounded-full" /><Skeleton className="h-4 w-20" /></div></td>
                <td className="whitespace-nowrap px-4 py-3"><Skeleton className="h-4 w-20" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
