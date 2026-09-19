import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { publicSupabaseEnv, supabaseSecretKey } from "@/lib/supabase/env";

export function createAdminClient() {
  const { url } = publicSupabaseEnv();
  return createSupabaseClient<Database>(url, supabaseSecretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
