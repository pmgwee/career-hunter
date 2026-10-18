import { NextResponse } from "next/server";
import { loadCareerWorkspace } from "@/lib/workspace/snapshot";
import { writeWorkspaceFiles } from "@/lib/workspace/write-files";
import { readJsonObject } from "@/lib/json-body";

const MAX_CV_BYTES = 200_000;

export async function GET() {
  try {
    const snapshot = await loadCareerWorkspace({ includeFilePaths: ["cv.md"] });
    return NextResponse.json({ content: snapshot.files.get("cv.md") ?? "", exists: snapshot.files.has("cv.md") });
  } catch {
    return NextResponse.json({ error: "Cloud CV is unavailable. Please retry." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const body = await readJsonObject<{ content?: string }>(req);
  if (!body) return NextResponse.json({ error: "bad json" }, { status: 400 });
  if (typeof body.content !== "string") {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }
  if (Buffer.byteLength(body.content, "utf8") > MAX_CV_BYTES) {
    return NextResponse.json({ error: "CV is too large (over 200KB)" }, { status: 413 });
  }
  try {
    const snapshot = await loadCareerWorkspace({ includeFilePaths: ["cv.md"] });
    await writeWorkspaceFiles(snapshot, [{ path: "cv.md", content: body.content, contentType: "text/markdown; charset=utf-8" }]);
    return NextResponse.json({ ok: true, versioned: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "write failed" }, { status: 500 });
  }
}
