import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillWithContent } from "../types";

export async function getBills(): Promise<BillWithContent[]> {
  // キャッシュ外でcookiesにアクセス
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedBills(difficultyLevel);
}

const _getCachedBills = unstable_cache(
  async (difficultyLevel: DifficultyLevelEnum): Promise<BillWithContent[]> => {
    const supabase = createAdminClient();

    // JOINを使用して一度のクエリでbill_contentsも取得
    // 公開ステータスの議案のみを取得
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
      .eq("publish_status", "published") // 公開済み議案のみ
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
        bill_content: Array.isArray(bill_contents)
          ? bill_contents[0]
          : undefined,
      };
    });

    return billsWithContent;
  },
  ["bills-list"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS],
  }
);
