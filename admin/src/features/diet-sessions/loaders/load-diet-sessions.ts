import { createAdminClient } from "@mirai-gikai/supabase";
import type { DietSession } from "../types";

export async function loadDietSessions(): Promise<DietSession[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("diet_sessions")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(`国会会期の取得に失敗しました: ${error.message}`);
  }

  return data || [];
}
