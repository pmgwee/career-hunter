import { loadCareerWorkspace, reportFromSnapshot } from "@/lib/workspace/snapshot";
import { runReadonlyCore } from "@/lib/workspace/readonly-core.mjs";
import { resolveCodeRoot } from "@/lib/core/code-root.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const id = (new URL(req.url).searchParams.get("report") ?? "").trim();
  if (!/^\d+$/.test(id)) return Response.json({ available: false, reason: "no-report", result: null });
  const snapshot = await loadCareerWorkspace({ reportApplicationNumber: id, includeFilePaths: ["cv.md"] });
  const report = reportFromSnapshot(snapshot, id);
  if (!report) return Response.json({ available: false, reason: "no-report", result: null });
  const { data, noKeywords } = await runReadonlyCore({ files: snapshot.files, codeRoot: resolveCodeRoot(process.cwd()),
    script: "keyword-match", args: [{ file: `reports/${report.file}` }, "--json"] });
  return Response.json({ available: Boolean(data), reason: data ? null : noKeywords ? "no-keywords" : "unavailable", result: data });
}
