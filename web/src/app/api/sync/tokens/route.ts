import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase
    .from("career_sync_tokens")
    .select("id, name, last_used_at, expires_at, revoked_at, created_at")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ tokens: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { name?: unknown };
  const name = String(body.name ?? "Local computer").trim().slice(0, 80) || "Local computer";
  const { data: workspace, error: workspaceError } = await supabase
    .from("career_workspaces")
    .select("id, owner_id")
    .eq("slug", "default")
    .single();
  if (workspaceError || !workspace) return Response.json({ error: workspaceError?.message ?? "Workspace not found" }, { status: 500 });

  const token = `cos_${randomBytes(32).toString("base64url")}`;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { error } = await supabase.from("career_sync_tokens").insert({
    workspace_id: workspace.id,
    owner_id: workspace.owner_id,
    name,
    token_hash: tokenHash,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ token, message: "Copy this token now. It cannot be shown again." }, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing token id" }, { status: 400 });
  const { error } = await supabase
    .from("career_sync_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
