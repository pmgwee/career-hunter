import { readCloudPanel } from "@/lib/workspace/read-panels";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const { data } = await readCloudPanel("analyze-patterns");
  return Response.json({ available: Boolean(data), patterns: data });
}
