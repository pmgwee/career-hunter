import "server-only";
import { resolveCodeRoot } from "@/lib/core/code-root.mjs";
import { loadCareerWorkspace } from "./snapshot";
import { runReadonlyCore } from "./readonly-core.mjs";

/** Fetch only the authenticated inputs a read-only panel needs. */
export async function readCloudPanel(script: string, args: Array<string | { file: string }> = []) {
  const snapshot = await loadCareerWorkspace({
    includeReports: script !== "stats" && script !== "rejection-latency",
    includeFilePaths: ["cv.md", "config/profile.yml", "portals.yml", "data/follow-ups.md",
      "data/active-interviews.md", "data/scan-runs.tsv", "data/portal-health.tsv"],
  });
  return runReadonlyCore({ files: snapshot.files, codeRoot: resolveCodeRoot(process.cwd()), script, args });
}
