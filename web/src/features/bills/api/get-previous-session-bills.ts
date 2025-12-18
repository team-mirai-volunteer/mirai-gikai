import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillWithContent } from "../types";
import { fetchTagsByBillIds } from "./helpers/get-bill-tags";

const MAX_PREVIEW_BILLS = 5;

/**
 * 前回の国会会期の議案を取得（プレビュー用、最大5件）
 */
export async function getPreviousSessionBills(
  dietSessionId: string
): Promise<BillWithContent[]> {
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedPreviousSessionBills(dietSessionId, difficultyLevel);
}

const _getCachedPreviousSessionBills = unstable_cache(
  async (
    dietSessionId: string,
    difficultyLevel: DifficultyLevelEnum
  ): Promise<BillWithContent[]> => {
    const supabase = createAdminClient();

    // 会期IDに紐づく公開済み議案を取得（最大5件）
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
      .eq("diet_session_id", dietSessionId)
      .eq("publish_status", "published")
      .eq("bill_contents.difficulty_level", difficultyLevel)
      .order("published_at", { ascending: false })
      .limit(MAX_PREVIEW_BILLS);

    if (error) {
      console.error("Failed to fetch previous session bills:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // タグ情報を取得
    const billIds = data.map((item) => item.id);
    const tagsByBillId = await fetchTagsByBillIds(supabase, billIds);

    const billsWithContent: BillWithContent[] = data.map((item) => {
      const { bill_contents, ...bill } = item;
      return {
        ...bill,
        bill_content: Array.isArray(bill_contents)
          ? bill_contents[0]
          : undefined,
        tags: tagsByBillId.get(item.id) ?? [],
      };
    });

    return billsWithContent;
  },
  ["previous-session-bills"],
  {
    revalidate: 600, // 10分
    tags: [CACHE_TAGS.BILLS],
  }
);
