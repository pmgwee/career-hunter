"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { publicSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, publishableKey } = publicSupabaseEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
