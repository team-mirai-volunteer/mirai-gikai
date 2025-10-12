import { createAdminClient } from "@mirai-gikai/supabase";
import type { DietSession } from "../types";

/**
 * 現在開催中の国会会期を取得
 * 現在日付が開始日と終了日の範囲内にある会期を返す
 */
export async function getCurrentDietSession(): Promise<DietSession | null> {
  const supabase = createAdminClient();

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式

  const { data, error } = await supabase
    .from("diet_sessions")
    .select("*")
    .lte("start_date", today) // start_date <= today
    .gte("end_date", today) // end_date >= today
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch current diet session:", error);
    return null;
  }

  return data;
}
