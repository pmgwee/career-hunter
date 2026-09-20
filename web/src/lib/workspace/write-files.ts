import "server-only";

import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import type { CareerWorkspaceSnapshot } from "@/lib/workspace/snapshot";

export type CloudFileWrite = {
  path: string;
  content: string;
  contentType?: string;
};

/** Persist one or more user-layer text files in the authenticated workspace. */
export async function writeWorkspaceFiles(
  snapshot: Pick<CareerWorkspaceSnapshot, "workspaceId" | "ownerId">,
  files: readonly CloudFileWrite[],
): Promise<void> {
  const rows = files.map((file) => ({
    workspace_id: snapshot.workspaceId,
    owner_id: snapshot.ownerId,
    path: file.path,
    content: file.content,
    content_type: file.contentType ?? "text/plain; charset=utf-8",
    sha256: createHash("sha256").update(file.content).digest("hex"),
    source: "web",
    deleted_at: null,
  }));
  const supabase = await createClient();
  const { error } = await supabase.from("career_files").upsert(rows, { onConflict: "workspace_id,path" });
  if (error) throw new Error(error.message);
}
