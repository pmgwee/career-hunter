import { isRealISODate, localISODate } from "@/lib/followups";
import { withLogLock, followupsWriteError } from "@/lib/followups-server";
import { loadCareerWorkspace } from "@/lib/workspace/snapshot";
import { writeWorkspaceFiles } from "@/lib/workspace/write-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pin an application's NEXT follow-up date, overriding the computed cadence.
// Stored as a directive line in data/follow-ups.md —
//   - next #42 2026-07-10 (set 2026-07-02)
// — which the core followup-cadence.mjs reads (parseNextOverrides). The pin
// wins over the computed schedule (it even revives a cold application) until a
// follow-up is logged on/after the set-date, which resumes the normal cadence.

const pinRe = (appNum: number) => new RegExp(`^-\\s+next\\s+#${appNum}\\s`, "i");

export async function POST(req: Request) {
  let body: { appNum?: string | number; date?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  const appNum = Number.parseInt(String(body.appNum ?? ""), 10);
  if (!Number.isInteger(appNum) || appNum < 0) {
    return Response.json({ error: "appNum (application #) required" }, { status: 400 });
  }
  const date = (body.date ?? "").trim();
  if (!isRealISODate(date)) {
    return Response.json({ error: "date must be a real calendar date (YYYY-MM-DD)" }, { status: 400 });
  }

  try {
    return await withLogLock(async () => {
      const snapshot = await loadCareerWorkspace({ includeFilePaths: ["data/follow-ups.md"] });
      let existing = snapshot.files.get("data/follow-ups.md") ?? "# Follow-ups\n\n";
      // Supersede: drop any previous pin lines for this application (the parser
      // takes the last one anyway; pruning keeps the file tidy).
      const kept = existing.split("\n").filter((line) => !pinRe(appNum).test(line));
      existing = kept.join("\n");
      if (!existing.endsWith("\n")) existing += "\n";
      existing += `- next #${appNum} ${date} (set ${localISODate()})\n`;
      await writeWorkspaceFiles(snapshot, [{ path: "data/follow-ups.md", content: existing, contentType: "text/markdown; charset=utf-8" }]);
      return Response.json({ ok: true, appNum, date });
    });
  } catch (e) {
    return followupsWriteError(e, "write failed");
  }
}

// Clear the pin for an application (the computed cadence takes over again).
export async function DELETE(req: Request) {
  let body: { appNum?: string | number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  const appNum = Number.parseInt(String(body.appNum ?? ""), 10);
  if (!Number.isInteger(appNum) || appNum < 0) {
    return Response.json({ error: "appNum (application #) required" }, { status: 400 });
  }

  try {
    return await withLogLock(async () => {
      const snapshot = await loadCareerWorkspace({ includeFilePaths: ["data/follow-ups.md"] });
      const existing = snapshot.files.get("data/follow-ups.md");
      if (existing == null) return Response.json({ error: "no follow-up log" }, { status: 404 });
      const lines = existing.split("\n");
      const kept = lines.filter((line) => !pinRe(appNum).test(line));
      if (kept.length === lines.length) {
        return Response.json({ error: `no pinned next-date for application #${appNum}` }, { status: 404 });
      }
      await writeWorkspaceFiles(snapshot, [{ path: "data/follow-ups.md", content: kept.join("\n"), contentType: "text/markdown; charset=utf-8" }]);
      return Response.json({ ok: true, appNum });
    });
  } catch (e) {
    return followupsWriteError(e, "delete failed");
  }
}
