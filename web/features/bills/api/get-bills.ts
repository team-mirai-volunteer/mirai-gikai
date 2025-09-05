import { createAdminClient } from "@mirai-gikai/supabase/server";
import type { BillWithStance } from "../types";

export async function getBills(): Promise<BillWithStance[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bills")
    .select(`
      *,
      mirai_stance:mirai_stances(*)
    `)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bills: ${error.message}`);
  }

  // Transform the data to match our type
  return data.map((bill) => ({
    ...bill,
    mirai_stance: bill.mirai_stance?.[0] || undefined,
  }));
}