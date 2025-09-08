import { createAdminClient } from "@mirai-gikai/supabase";
import type { Bill } from "../types";

export async function getBills(): Promise<Bill[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bills")
    .select(`*`)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bills: ${error.message}`);
  }

  return data;
}
