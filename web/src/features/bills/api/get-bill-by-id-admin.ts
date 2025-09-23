import { createAdminClient } from "@mirai-gikai/supabase";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import type { BillWithContent } from "../types";
import { getBillContentWithDifficulty } from "./helpers/get-bill-content";

/**
 * 管理者用: 公開/非公開問わず議案を取得
 * プレビュー機能で使用
 * キャッシュなしで常に最新のデータを取得
 */
export async function getBillByIdAdmin(
  id: string
): Promise<BillWithContent | null> {
  const difficultyLevel = await getDifficultyLevel();
  const supabase = createAdminClient();

  // 基本的なbill情報、見解、コンテンツを並列取得
  // ステータスに関係なく取得（管理者用）
  const [billResult, miraiStanceResult, billContent] = await Promise.all([
    supabase.from("bills").select("*").eq("id", id).single(),
    supabase.from("mirai_stances").select("*").eq("bill_id", id).single(),
    getBillContentWithDifficulty(id, difficultyLevel),
  ]);

  const { data: bill, error: billError } = billResult;
  if (billError || !bill) {
    console.error("Failed to fetch bill:", billError);
    return null;
  }

  const { data: miraiStance } = miraiStanceResult;

  return {
    ...bill,
    mirai_stance: miraiStance || undefined,
    bill_content: billContent || undefined,
  };
}
