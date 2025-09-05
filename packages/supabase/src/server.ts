import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.types";

// Service role client for server-side operations that bypass RLS
export function createAdminClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
