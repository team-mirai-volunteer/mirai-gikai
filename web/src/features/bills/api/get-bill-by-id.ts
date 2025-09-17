import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import type { BillWithContent } from "../types";

export async function getBillById(id: string): Promise<BillWithContent | null> {
  // キャッシュ外でcookiesにアクセス
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedBillById(id, difficultyLevel);
}

const _getCachedBillById = unstable_cache(
  async (
    id: string,
    difficultyLevel: DifficultyLevelEnum
  ): Promise<BillWithContent | null> => {
    const supabase = createAdminClient();

    // 基本的なbill情報、見解、コンテンツを並列取得
    const [billResult, miraiStanceResult, billContent] = await Promise.all([
      supabase.from("bills").select("*").eq("id", id).single(),
      supabase.from("mirai_stances").select("*").eq("bill_id", id).single(),
      _getBillContentWithDifficulty(id, difficultyLevel),
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
  },
  ["bill-by-id"],
  {
    revalidate: 600, // 10分（600秒）
    tags: ["bills"],
  }
);

async function _getBillContentWithDifficulty(
  billId: string,
  difficultyLevel: DifficultyLevelEnum
) {
  const supabase = createAdminClient();

  // 選択された難易度のコンテンツを取得
  const { data: billContent, error } = await supabase
    .from("bill_contents")
    .select("*")
    .eq("bill_id", billId)
    .eq("difficulty_level", difficultyLevel)
    .single();

  if (error) {
    console.error(`Failed to fetch bill content: ${error.message}`);
    return null;
  }

  return billContent;
}
