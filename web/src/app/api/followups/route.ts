import { loadFollowupsResponse } from "@/lib/followups-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const full = new URL(req.url).searchParams.get("full") === "1";
  try {
    return Response.json(await loadFollowupsResponse(full));
  } catch (error) {
    return Response.json(
      {
        available: false,
        metadata: null,
        entries: [],
        error: error instanceof Error ? error.message : "Follow-ups unavailable",
      },
      { status: 500 },
    );
  }
}
