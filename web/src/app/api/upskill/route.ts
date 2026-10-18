import { readCloudPanel } from "@/lib/workspace/read-panels";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const { data } = await readCloudPanel("upskill");
  return Response.json({ available: Boolean(data), reason: data ? null : "unavailable", data });
}
