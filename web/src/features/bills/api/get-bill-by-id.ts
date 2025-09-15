import { createAdminClient } from "@mirai-gikai/supabase";
import { getDifficultyLevel } from "../actions/difficulty";
import type { BillWithContent } from "../types";

export async function getBillById(id: string): Promise<BillWithContent | null> {
  const supabase = createAdminClient();

  // 現在の難易度設定を取得
  const difficultyLevel = await getDifficultyLevel();

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

  // 選択された難易度のコンテンツを取得
  const { data: billContent } = await supabase
    .from("bill_contents")
    .select("*")
    .eq("bill_id", id)
    .eq("difficulty_level", difficultyLevel)
    .single();

  return {
    ...bill,
    mirai_stance: miraiStance || undefined,
    bill_content: billContent || undefined,
  };
}
