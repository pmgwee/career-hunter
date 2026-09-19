import { loadCareerWorkspace } from "@/lib/workspace/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // always read fresh local files

// Exposes the user's pipeline (inbox + tracker) to the client so the assistant
// can resolve "all the Anthropic ones" to concrete postings CLIENT-SIDE — the
// model only ever emits a company name, never URLs (no hallucination, no tokens).
export async function GET() {
  const s = await loadCareerWorkspace();
  return Response.json({
    inbox: s.inbox,
    applications: s.applications,
    root: `cloud://${s.workspaceId}`,
    rootExists: true,
    revision: s.revision,
  });
}
