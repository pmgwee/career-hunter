import { readCloudPanel } from "@/lib/workspace/read-panels";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const company = (new URL(req.url).searchParams.get("company") ?? "").replace(/[\r\n\0]/g, "").trim().slice(0, 120);
  if (!company) return Response.json({ available: false, reason: "no-company", card: null });
  const { data } = await readCloudPanel("company-history", ["--company", company]);
  return Response.json({ available: Boolean(data), card: data });
}
