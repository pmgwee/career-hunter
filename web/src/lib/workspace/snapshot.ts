import "server-only";

import path from "node:path";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { parseApplicationsWithAliases } from "@/lib/tracker-table.mjs";
import type { Application, InboxJob, LifecyclePhase, ReportData } from "@/lib/career-ops";

type CloudFile = { path: string; content: string; revision: number; updated_at: string };
type CloudWorkspaceRow = {
  id: string;
  owner_id: string;
  revision: number;
  files: CloudFile[];
  prerequisites: Array<{ path: string }>;
};

const CORE_FILE_PATHS = [
  "data/applications.md",
  "data/pipeline.md",
  "data/scan-history.tsv",
  "data/status-log.tsv",
  "tracker-aliases.json",
] as const;

const PREREQUISITE_PATHS = ["cv.md", "config/profile.yml", "modes/_profile.md", "portals.yml"] as const;

export type CareerWorkspaceOptions = {
  /** Load report bodies only for pages that actually render or analyse them. */
  includeReports?: boolean;
  /** Limit a report page to the linked report when possible. */
  reportApplicationNumber?: string;
  /** Fetch the contents of additional synchronized files for this route. */
  includeFilePaths?: readonly string[];
};

export type CareerWorkspaceSnapshot = {
  workspaceId: string;
  ownerId: string;
  revision: number;
  files: ReadonlyMap<string, string>;
  inbox: InboxJob[];
  applications: Application[];
  reportsByApplication: ReadonlyMap<string, ReportData>;
  phase: LifecyclePhase;
  onboardingNeeded: boolean;
  missing: string[];
};

const LABELED_SEGMENT = /^([a-z][a-z_-]*):\s*(.*)$/i;

function parseInbox(md: string): InboxJob[] {
  const jobs: InboxJob[] = [];
  for (const line of md.split("\n")) {
    const match = line.match(/^\s*-\s*\[([ xX])\]\s*(.+)$/);
    if (!match) continue;
    const all = match[2].split("|").map((part) => part.trim());
    const labels = new Map<string, string>();
    const parts: string[] = [];
    for (const [index, segment] of all.entries()) {
      const labelled = index >= 3 ? segment.match(LABELED_SEGMENT) : null;
      if (labelled) labels.set(labelled[1].toLowerCase(), labelled[2].trim());
      else parts.push(segment);
    }
    if (parts.length < 3 || !parts[0]) continue;
    const posted = labels.get("posted");
    jobs.push({
      done: match[1].toLowerCase() === "x",
      url: parts[0],
      company: parts[1],
      role: parts[2],
      location: parts[3] || undefined,
      compensation: parts[4] || undefined,
      postedAt: posted && /^\d{4}-\d{2}-\d{2}$/.test(posted) ? posted : undefined,
    });
  }
  return jobs;
}

function parseScanDates(tsv: string): Map<string, string> {
  const dates = new Map<string, string>();
  for (const [index, line] of tsv.split("\n").entries()) {
    if (!line || (index === 0 && line.startsWith("url\t"))) continue;
    const tab = line.indexOf("\t");
    if (tab < 1) continue;
    const firstSeen = line.slice(tab + 1).split("\t")[0]?.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(firstSeen) && !dates.has(line.slice(0, tab))) {
      dates.set(line.slice(0, tab), firstSeen);
    }
  }
  return dates;
}

function aliases(files: ReadonlyMap<string, string>): Record<string, string> {
  try {
    const parsed = JSON.parse(files.get("tracker-aliases.json") ?? "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {
    // A corrupt alias file falls back to the legacy tracker shape.
  }
  return {};
}

function linkedReportPath(application: Application): string | null {
  const linked = application.report.match(/\]\(([^)]+)\)/)?.[1];
  if (!linked) return null;
  const normalized = path.posix.normalize(path.posix.join("data", linked.replaceAll("\\", "/")));
  return normalized.startsWith("reports/") && normalized.endsWith(".md") ? normalized : null;
}

function reportsForApplications(files: ReadonlyMap<string, string>, applications: Application[]) {
  const reports = new Map<string, ReportData>();
  const available = [...files.keys()].filter((file) => /^reports\/[^/]+\.md$/i.test(file) && !/-RESERVED\.md$/i.test(file));
  for (const application of applications) {
    const linked = linkedReportPath(application);
    const fallback = available.find((file) => Number.parseInt(path.posix.basename(file), 10) === Number.parseInt(application.n, 10));
    const file = linked && files.has(linked) ? linked : fallback;
    if (file) reports.set(application.n, { file: path.posix.basename(file), content: files.get(file) ?? "" });
  }
  return reports;
}

export async function loadCareerWorkspace(options: CareerWorkspaceOptions = {}): Promise<CareerWorkspaceSnapshot> {
  const supabase = await createClient();
  const contentPaths = [...new Set([...CORE_FILE_PATHS, ...(options.includeFilePaths ?? [])])];
  const forwardedUserId = (await headers()).get("x-career-ops-user-id");

  // Auth verification and the RLS-protected data request are independent.
  // Run them together, and embed both file collections in the workspace query,
  // so a page pays one Supabase latency window instead of auth -> workspace ->
  // two file queries. The duplicate relation aliases intentionally return
  // content only for route data while keeping prerequisite checks path-only.
  const [authResult, workspaceResult] = await Promise.all([
    forwardedUserId ? Promise.resolve(null) : supabase.auth.getClaims(),
    supabase
      .from("career_workspaces")
      .select(
        "id, owner_id, revision, files:career_files!career_files_workspace_owner_fk(path, content, revision, updated_at), prerequisites:career_files!career_files_workspace_owner_fk(path)",
      )
      .eq("slug", "default")
      .is("files.deleted_at", null)
      .in("files.path", contentPaths)
      .is("prerequisites.deleted_at", null)
      .in("prerequisites.path", [...PREREQUISITE_PATHS])
      .single(),
  ]);
  const authenticatedUserId = forwardedUserId ?? authResult?.data?.claims?.sub;
  if (authResult?.error || !authenticatedUserId) throw new Error("Authenticated workspace is unavailable");
  const { data: workspaceData, error: workspaceError } = workspaceResult;
  if (workspaceError || !workspaceData) throw new Error(workspaceError?.message ?? "Career workspace is missing");
  const workspace = workspaceData as unknown as CloudWorkspaceRow;
  if (workspace.owner_id !== authenticatedUserId) throw new Error("Authenticated workspace is unavailable");

  const files = new Map((workspace.files ?? []).map((file) => [file.path, file.content]));
  for (const prerequisite of workspace.prerequisites ?? []) {
    if (!files.has(prerequisite.path)) files.set(prerequisite.path, "");
  }
  const applications = parseApplicationsWithAliases(files.get("data/applications.md") ?? "", aliases(files));
  const scanDates = parseScanDates(files.get("data/scan-history.tsv") ?? "");
  const inbox = parseInbox(files.get("data/pipeline.md") ?? "").map((job) => ({
    ...job,
    postedAt: job.postedAt ?? scanDates.get(job.url),
  }));
  const prerequisiteFiles = ["cv.md", "config/profile.yml", "modes/_profile.md", "portals.yml"];
  const missing = prerequisiteFiles.filter((file) => !files.has(file));
  const hasCv = files.has("cv.md");
  const hasData = applications.length > 0 || inbox.some((job) => !job.done);
  const onboardingNeeded = missing.length > 0;
  const phase: LifecyclePhase = !hasCv && !hasData ? "first-run" : onboardingNeeded ? "in-between" : "established";

  if (options.includeReports || options.reportApplicationNumber) {
    const linked = options.reportApplicationNumber
      ? applications.find((application) => application.n === options.reportApplicationNumber)
      : null;
    const linkedPath = linked ? linkedReportPath(linked) : null;
    const reportQuery = () =>
      supabase
        .from("career_files")
        .select("path, content, revision, updated_at")
        .eq("workspace_id", workspace.id)
        .is("deleted_at", null);
    const reportResult = linkedPath
      ? await reportQuery().eq("path", linkedPath)
      : await reportQuery().like("path", "reports/%");
    if (reportResult.error) throw new Error(reportResult.error.message);
    for (const file of reportResult.data as CloudFile[]) files.set(file.path, file.content);

    // A tracker link can point at a report that was renamed or not synced yet.
    // Preserve the old numeric fallback instead of turning that case into a
    // blank report page.
    if (linkedPath && reportResult.data.length === 0) {
      const fallbackResult = await reportQuery().like("path", "reports/%");
      if (fallbackResult.error) throw new Error(fallbackResult.error.message);
      for (const file of fallbackResult.data as CloudFile[]) files.set(file.path, file.content);
    }
  }

  return {
    workspaceId: workspace.id,
    ownerId: workspace.owner_id,
    revision: workspace.revision,
    files,
    inbox,
    applications,
    reportsByApplication: reportsForApplications(files, applications),
    phase,
    onboardingNeeded,
    missing,
  };
}

export function reportFromSnapshot(snapshot: CareerWorkspaceSnapshot, applicationNumber: string): ReportData | null {
  return snapshot.reportsByApplication.get(applicationNumber) ?? null;
}
