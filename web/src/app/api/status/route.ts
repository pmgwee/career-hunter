import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { canonicalizeStatus } from "@/lib/core/states";
import { detectColumnMap } from "@/lib/tracker-table.mjs";
import { createClient } from "@/lib/supabase/server";
import { loadCareerWorkspace } from "@/lib/workspace/snapshot";

export const runtime = "nodejs";

function aliases(raw: string | undefined): Record<string, string> {
  try {
    const parsed = JSON.parse(raw ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function cells(line: string): string[] {
  const parts = line.split("|").map((cell) => cell.trim());
  return parts.slice(1, line.trimEnd().endsWith("|") ? -1 : undefined);
}

function updateStatus(markdown: string, rowNumber: string, status: string, aliasMap: Record<string, string>) {
  const lines = markdown.split("\n");
  const map = detectColumnMap(lines, aliasMap);
  if (!map || map.n == null || map.status == null) throw new Error("Tracker header does not contain # and Status columns");
  let previous = "";
  let found = false;
  const updated = lines.map((line) => {
    if (!line.trim().startsWith("|")) return line;
    const values = cells(line);
    if (values[map.n] !== rowNumber) return line;
    found = true;
    previous = values[map.status] ?? "";
    values[map.status] = status;
    return `| ${values.join(" | ")} |`;
  });
  if (!found) throw new Error(`Application #${rowNumber} was not found`);
  return { content: updated.join("\n"), previous, changed: previous !== status };
}

export async function POST(request: Request) {
  let body: { n?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const rowNumber = typeof body.n === "string" && /^\d+$/.test(body.n) ? body.n : "";
  const requested = typeof body.status === "string" ? body.status.trim() : "";
  if (!rowNumber || !requested || /[|\r\n*]/.test(requested)) {
    return NextResponse.json({ error: "a tracker row number and valid status are required" }, { status: 400 });
  }
  const canon = canonicalizeStatus(requested);
  if (!canon) return NextResponse.json({ error: `not a canonical status: ${requested}` }, { status: 400 });

  const snapshot = await loadCareerWorkspace();
  const trackerPath = "data/applications.md";
  const tracker = snapshot.files.get(trackerPath);
  if (!tracker) return NextResponse.json({ error: "Cloud tracker is not initialized" }, { status: 409 });

  let result;
  try {
    result = updateStatus(tracker, rowNumber, canon, aliases(snapshot.files.get("tracker-aliases.json")));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update tracker" }, { status: 404 });
  }
  if (!result.changed) return NextResponse.json({ ok: true, status: canon, changed: false, statusLogged: false });

  const logPath = "data/status-log.tsv";
  const existingLog = snapshot.files.get(logPath) ?? "tracker#\tdate\tfrom\tto\tsource\tnote\n";
  const log = `${existingLog.replace(/\n?$/, "\n")}${rowNumber}\t${new Date().toISOString().slice(0, 10)}\t${result.previous || "-"}\t${canon}\tweb\t\n`;
  const fileRows = [
    { path: trackerPath, content: result.content },
    { path: logPath, content: log },
  ].map((file) => ({
    workspace_id: snapshot.workspaceId,
    owner_id: snapshot.ownerId,
    path: file.path,
    content: file.content,
    content_type: "text/plain; charset=utf-8",
    sha256: createHash("sha256").update(file.content).digest("hex"),
    source: "web",
    deleted_at: null,
  }));
  const supabase = await createClient();
  const { error } = await supabase.from("career_files").upsert(fileRows, { onConflict: "workspace_id,path" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: canon, changed: true, statusLogged: true });
}
