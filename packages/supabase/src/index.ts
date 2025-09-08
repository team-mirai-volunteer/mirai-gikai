// Export types
export type { Database } from "../types/supabase.types";

// Framework-agnostic clients
export { createAdminClient } from "./admin";
export { createClient as createBrowserClient } from "./browser";
