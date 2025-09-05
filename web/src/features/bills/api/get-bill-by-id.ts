import { createAdminClient } from "@mirai-gikai/supabase/server";
import type { BillWithStance } from "../types";

export async function getBillById(id: string): Promise<BillWithStance | null> {
  const supabase = createAdminClient();

  const { data: bill, error: billError } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .single();

  if (billError || !bill) {
    console.error("Failed to fetch bill:", billError);
    return null;
  }

  // みらい政党の見解を取得
  const { data: miraiStance } = await supabase
    .from("mirai_stances")
    .select("*")
    .eq("bill_id", id)
    .single();

  return {
    ...bill,
    mirai_stance: miraiStance || undefined,
  };
}
