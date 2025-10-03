import { createAdminClient } from "@mirai-gikai/supabase";
import type { Bill } from "../types";

export async function getBills(): Promise<Bill[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`議案の取得に失敗しました: ${error.message}`);
  }

  return data || [];
}
