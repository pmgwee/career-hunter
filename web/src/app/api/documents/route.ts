import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { loadCareerWorkspace } from "@/lib/workspace/snapshot";
import { inlineDisposition } from "@/lib/content-disposition.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const snapshot = await loadCareerWorkspace();
  const supabase = await createClient();
  const id = new URL(req.url).searchParams.get("id");
  const query = () => supabase.from("career_artifacts")
    .select("id,path,object_name,mime_type,updated_at")
    .eq("workspace_id", snapshot.workspaceId).eq("owner_id", snapshot.ownerId).is("deleted_at", null);
  if (id) {
    if (!/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(id)) return Response.json({error:"Invalid document id"},{status:400});
    const { data: row, error } = await query().eq("id",id).single();
    if (error || !row || !row.object_name.startsWith(snapshot.ownerId + "/") || row.mime_type !== "application/pdf")
      return Response.json({error:"Document not found"},{status:404});
    const { data, error: downloadError } = await supabase.storage.from("career-artifacts").download(row.object_name);
    if (downloadError || !data) return Response.json({error:"Document unavailable"},{status:404});
    return new Response(data, {headers:{"Content-Type":"application/pdf","Content-Disposition":inlineDisposition(path.posix.basename(row.path)),"Cache-Control":"private, no-store"}});
  }
  const { data, error } = await query().eq("mime_type","application/pdf");
  if (error) return Response.json({error:"Documents unavailable"},{status:503});
  return Response.json(data.map(row => ({
    id:row.id,filename:path.posix.basename(row.path),
    kind:/cover/i.test(row.path)?"cover":/cv|resume/i.test(row.path)?"cv":"unknown",
    date:row.updated_at.slice(0,10),reportId:null,format:"pdf",mtimeMs:Date.parse(row.updated_at),
  })));
}
