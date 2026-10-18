import { notFound } from "next/navigation";
import { loadCareerWorkspace, reportFromSnapshot } from "@/lib/workspace/snapshot";
import { ReportView } from "@/components/report-view";
import { pipelineQuery } from "@/lib/pipeline-navigation.mjs";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = pipelineQuery(await searchParams);
  const snapshot = await loadCareerWorkspace({ reportApplicationNumber: id });
  const app = snapshot.applications.find((row) => row.n === id) ?? null;
  const report = reportFromSnapshot(snapshot, id);
  if (!app && !report) notFound();
  // Resolved here rather than in the component so the link is only rendered when
  // THIS application's cover is actually on disk. `id` is passed as the
  // application number, never as a company: a report with no tracker row has no
  // identity to match on, and guessing one from the id would surface another
  // offer's cover.
  const coverReady = false;
  return (
    <ReportView
      id={id}
      app={app}
      report={report?.content ?? null}
      file={report?.file ?? null}
      canDelete={false}
      pdfReadyFromIndex={false}
      coverReady={coverReady}
      backHref={`/pipeline${query ? `?${query}` : ""}`}
    />
  );
}
