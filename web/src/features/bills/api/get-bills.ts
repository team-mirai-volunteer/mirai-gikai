import { createAdminClient } from "@mirai-gikai/supabase";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import type { BillWithContent } from "../types";

export async function getBills(): Promise<BillWithContent[]> {
  const supabase = createAdminClient();

  // 現在の難易度設定を取得
  const difficultyLevel = await getDifficultyLevel();

  // JOINを使用して一度のクエリでbill_contentsも取得
  const { data, error } = await supabase
    .from("bills")
    .select(
      `
      *,
      bill_contents!inner (
        id,
        bill_id,
        title,
        summary,
        content,
        difficulty_level,
        created_at,
        updated_at
      )
    `
    )
    .eq("bill_contents.difficulty_level", difficultyLevel)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bills: ${error.message}`);
  }

  // データ構造を整形
  const billsWithContent: BillWithContent[] = data.map((item) => {
    const { bill_contents, ...bill } = item;
    return {
      ...bill,
      bill_content: Array.isArray(bill_contents) ? bill_contents[0] : undefined,
    };
  });

  return billsWithContent;
}
