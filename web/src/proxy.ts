import type { NextRequest } from "next/server";
import { refreshSession } from "@/lib/supabase/proxy";
import { NextResponse } from "next/server";
import { rejectsCrossOriginWrite, requiresLocalWorker } from "@/lib/workspace/cloud-route-policy.mjs";

export async function proxy(request: NextRequest) {
  if (rejectsCrossOriginWrite({method:request.method,origin:request.headers.get("origin"),
    site:request.headers.get("sec-fetch-site"),requestOrigin:request.nextUrl.origin})) {
    return NextResponse.json({error:"Cross-origin write refused"},{status:403});
  }
  // The auth proxy still gates all data routes. These paths hold no cloud
  // data and must fail explicitly instead of writing temporary local files.
  if (requiresLocalWorker(request.nextUrl.pathname)) {
    return NextResponse.json({available:false,code:"local-worker-required",
      error:"This feature needs your local Career-Ops worker; it is not persisted by the hosted dashboard."},{status:503});
  }
  return refreshSession(request);
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
