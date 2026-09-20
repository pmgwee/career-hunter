export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 py-8" aria-label="Loading page">
      <div className="h-7 w-48 rounded bg-surface-hover" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-surface-hover" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="h-28 rounded-2xl border border-border bg-surface/30" />
        <div className="h-28 rounded-2xl border border-border bg-surface/30" />
        <div className="h-28 rounded-2xl border border-border bg-surface/30" />
      </div>
      <div className="mt-6 h-80 rounded-2xl border border-border bg-surface/30" />
    </div>
  );
}
