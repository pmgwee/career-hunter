import "server-only";

import path from "node:path";
import { analyzeFromContent } from "../../../followup-cadence.mjs";
import type { CadenceEntry, CadenceMetadata, CadenceResponse } from "@/lib/followups";
import { loadCareerWorkspace } from "@/lib/workspace/snapshot";

type CadenceAnalysis = {
  error?: string;
  metadata?: CadenceMetadata;
  entries?: CadenceEntry[];
  cadenceConfig?: Record<string, number>;
};

function linkedReportPath(reportField: string): string | null {
  const linked = reportField.match(/\]\(([^)]+)\)/)?.[1];
  if (!linked) return null;
  const normalized = path.posix.normalize(path.posix.join("data", linked.replaceAll("\\", "/")));
  return normalized.startsWith("reports/") && normalized.endsWith(".md") ? normalized : null;
}

/** Run the canonical cadence engine against the authenticated cloud files. */
export async function loadFollowupsResponse(full = true): Promise<CadenceResponse> {
  const snapshot = await loadCareerWorkspace({
    includeFilePaths: ["data/follow-ups.md", "config/profile.yml"],
  });
  const analysis = analyzeFromContent(
    snapshot.files.get("data/applications.md") ?? "",
    snapshot.files.get("data/follow-ups.md") ?? "",
    {
      profileContent: snapshot.files.get("config/profile.yml") ?? "",
      resolveReportPath: linkedReportPath,
    },
  ) as CadenceAnalysis;
  if (analysis.error || !analysis.metadata || !Array.isArray(analysis.entries)) {
    return { available: false, metadata: null, entries: [] };
  }

  const entries = analysis.entries;
  if (full) {
    return {
      available: true,
      metadata: analysis.metadata,
      entries,
      cadenceConfig: analysis.cadenceConfig ?? null,
    };
  }
  const priority = entries
    .filter((entry) => /overdue|urgent/i.test(`${entry.urgency ?? ""} ${entry.status ?? ""}`))
    .slice(0, 8);
  return {
    available: true,
    metadata: analysis.metadata,
    entries: (priority.length ? priority : entries).slice(0, 6),
  };
}
