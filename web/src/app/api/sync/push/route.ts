import { createHash, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSyncablePath, MAX_SYNC_FILES, MAX_SYNC_FILE_BYTES, MAX_SYNC_TOTAL_BYTES } from "@/lib/workspace/sync-policy";

export const runtime = "nodejs";
export const maxDuration = 60;

type IncomingFile = { path?: unknown; content?: unknown; contentType?: unknown };

function bearer(request: Request): string | null {
  const value = request.headers.get("authorization") ?? "";
  return value.startsWith("Bearer cos_") ? value.slice(7) : null;
}

function equalHash(left: string, right: string): boolean {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

async function authorize(request: Request) {
  const token = bearer(request);
  if (!token) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const admin = createAdminClient();
  const { data } = await admin
    .from("career_sync_tokens")
    .select("id, workspace_id, owner_id, token_hash, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .limit(1);
  const record = data?.[0];
  if (!record || !equalHash(record.token_hash, tokenHash) || record.revoked_at || (record.expires_at && Date.parse(record.expires_at) <= Date.now())) return null;
  return { admin, record };
}

export async function GET(request: Request) {
  const auth = await authorize(request);
  if (!auth) return Response.json({ error: "Invalid or expired sync token" }, { status: 401 });
  const { data, error } = await auth.admin
    .from("career_files")
    .select("path, content, sha256, revision")
    .eq("workspace_id", auth.record.workspace_id)
    .is("deleted_at", null)
    .order("path");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const { data: workspace } = await auth.admin.from("career_workspaces").select("revision").eq("id", auth.record.workspace_id).single();
  await auth.admin.from("career_sync_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", auth.record.id);
  return Response.json({ files: data ?? [], revision: workspace?.revision ?? null });
}

export async function POST(request: Request) {
  const auth = await authorize(request);
  if (!auth) return Response.json({ error: "Invalid or expired sync token" }, { status: 401 });
  const { admin, record } = auth;

  const payload = await request.json().catch(() => null) as { files?: IncomingFile[] } | null;
  if (!payload || !Array.isArray(payload.files) || payload.files.length > MAX_SYNC_FILES) {
    return Response.json({ error: `Expected at most ${MAX_SYNC_FILES} files` }, { status: 400 });
  }

  let totalBytes = 0;
  const files = [];
  for (const item of payload.files) {
    const filePath = String(item.path ?? "").replaceAll("\\", "/");
    const content = String(item.content ?? "");
    const bytes = Buffer.byteLength(content, "utf8");
    totalBytes += bytes;
    if (!isSyncablePath(filePath) || bytes > MAX_SYNC_FILE_BYTES || totalBytes > MAX_SYNC_TOTAL_BYTES) {
      return Response.json({ error: `Rejected sync path or size: ${filePath}` }, { status: 400 });
    }
    files.push({
      workspace_id: record.workspace_id,
      owner_id: record.owner_id,
      path: filePath,
      content,
      content_type: String(item.contentType ?? "text/plain").slice(0, 100),
      sha256: createHash("sha256").update(content).digest("hex"),
      source: "local",
      deleted_at: null,
    });
  }

  if (files.length) {
    const { error } = await admin.from("career_files").upsert(files, { onConflict: "workspace_id,path" });
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }
  await admin.from("career_sync_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", record.id);
  const { data: workspace } = await admin.from("career_workspaces").select("revision").eq("id", record.workspace_id).single();
  return Response.json({ ok: true, files: files.length, revision: workspace?.revision ?? null });
}
