import { notFound } from "next/navigation";
import { ReportView } from "@/components/report-view";
import { loadCareerWorkspace, reportFromSnapshot } from "@/lib/workspace/snapshot";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await loadCareerWorkspace();
  const app = snapshot.applications.find((application) => application.n === id) ?? null;
  const report = reportFromSnapshot(snapshot, id);
  if (!app && !report) notFound();
  return <ReportView id={id} app={app} report={report?.content ?? null} file={report?.file ?? null} canDelete={false} />;
}
