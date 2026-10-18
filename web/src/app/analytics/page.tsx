import type { Application } from "@/lib/career-ops";
import { loadCareerWorkspace } from "@/lib/workspace/snapshot";
import { PipelineSankey } from "@/components/analytics/pipeline-sankey";
import { canonStatus } from "@/lib/format";
import { cumulativeProgressWithHistory } from "@/lib/funnel-tiles.mjs";
import { analyticsApplications } from "@/lib/analytics-data";
import { computeProgressMetrics, computeStatsMetrics, generateInsights, resolveAnalyticsView } from "@/lib/analytics-metrics.mjs";
import { AnalyticsShell, ProgressPanel, StatsPanel } from "@/components/analytics-view";
import { FunnelRates } from "@/components/analytics/funnel-rates";
import { SearchInsights } from "@/components/analytics/search-insights";
import { parseStatusLog } from "@/lib/pipeline-sankey.mjs";

export const dynamic = "force-dynamic";

export default async function Analytics({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const snapshot = await loadCareerWorkspace();
  const { applications } = snapshot;
  // One URL contract for all three views. Each view owns its reads, as on main:
  // an incomplete Progress core install must not take Insights/Search stats down.
  const view = resolveAnalyticsView(params.view, params.tab);
  return (
    <AnalyticsShell total={applications.length} view={view}>
      {view === "insights" ? <SearchInsights /> : view === "search-stats" ? <SearchStatsView /> : <ProgressView applications={applications} statusLog={snapshot.files.get("data/status-log.tsv") ?? ""} />}
    </AnalyticsShell>
  );
}

async function ProgressView({ applications, statusLog }: { applications: Application[]; statusLog: string }) {
  const achievements = await cumulativeProgressWithHistory(
    applications.map((app) => ({ n: app.n, status: canonStatus(app.status) })),
    statusLog,
  );
  return (
    <>
      <ProgressPanel metrics={computeProgressMetrics(applications, achievements)} />
      <PipelineSankey applications={applications} statusLog={parseStatusLog(statusLog)} />
      <FunnelRates />
    </>
  );
}

async function SearchStatsView() {
  const { applications, reportsByApplication } = await loadCareerWorkspace({ includeReports: true });
  const stats = computeStatsMetrics(analyticsApplications(applications, reportsByApplication));
  return <StatsPanel metrics={stats} insights={generateInsights(stats)} />;
}
