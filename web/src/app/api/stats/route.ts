import { readCloudPanel } from "@/lib/workspace/read-panels";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const { data } = await readCloudPanel("stats");
  return Response.json({ available: Boolean(data), stats: data });
}
