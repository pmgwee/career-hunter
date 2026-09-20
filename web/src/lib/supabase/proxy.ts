import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { publicSupabaseEnv } from "@/lib/supabase/env";

export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = publicSupabaseEnv();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const signedIn = Boolean(userId);
  // Device sync authenticates with its scoped bearer token instead of a browser
  // session cookie. Let the route validate that token and return JSON rather than
  // redirecting the CLI to the HTML login page.
  const syncPath = request.nextUrl.pathname === "/api/sync/push";
  const publicPath = request.nextUrl.pathname === "/login" || request.nextUrl.pathname.startsWith("/auth/") || syncPath;

  if (!signedIn && !publicPath) {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(target);
  }

  if (signedIn && request.nextUrl.pathname === "/login") {
    const target = request.nextUrl.clone();
    target.pathname = "/";
    target.search = "";
    return NextResponse.redirect(target);
  }

  if (signedIn && userId) {
    // The proxy already verified this claim. Forward it internally so server
    // components do not repeat a remote getClaims() call before every RSC data
    // query. Incoming values are overwritten and the workspace query remains
    // protected by Supabase RLS.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-career-ops-user-id", userId);
    const forwarded = NextResponse.next({ request: { headers: requestHeaders } });
    for (const cookie of response.cookies.getAll()) forwarded.cookies.set(cookie);
    response = forwarded;
  }

  return response;
}
