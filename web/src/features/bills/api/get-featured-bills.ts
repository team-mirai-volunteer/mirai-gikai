import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillWithContent } from "../types";

/**
 * 注目の議案を取得する
 * is_featured = true で公開済みの議案を最新順に取得
 */
export async function getFeaturedBills(): Promise<BillWithContent[]> {
  // キャッシュ外でcookiesにアクセス
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedFeaturedBills(difficultyLevel);
}

const _getCachedFeaturedBills = unstable_cache(
  async (difficultyLevel: DifficultyLevelEnum): Promise<BillWithContent[]> => {
    const supabase = createAdminClient();

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
        ),
        tags:bills_tags(
          tag:tags(
            id,
            label
          )
        )
      `
      )
      .eq("is_featured", true)
      .eq("bill_contents.difficulty_level", difficultyLevel)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch featured bills:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // すべての議案のタグを一度に取得（N+1回避）
    const billIds = data.map((item: { id: string }) => item.id);
    const { data: allBillTags } = await supabase
      .from("bills_tags")
      .select("bill_id, tags(id, label)")
      .in("bill_id", billIds);

    // bill_id ごとにタグをグループ化
    const tagsByBillId = new Map<
      string,
      Array<{ id: string; label: string }>
    >();
    allBillTags?.forEach((bt: { bill_id: string; tags: unknown }) => {
      if (bt.tags) {
        const existing = tagsByBillId.get(bt.bill_id) || [];
        tagsByBillId.set(bt.bill_id, [
          ...existing,
          bt.tags as { id: string; label: string },
        ]);
      }
    });

    // データ構造を整形
    return data.map((item) => {
      const { bill_contents, ...bill } = item;
      return {
        ...bill,
        bill_content: Array.isArray(bill_contents)
          ? bill_contents[0]
          : undefined,
        tags: tagsByBillId.get(item.id) || [],
      };
    }) as BillWithContent[];
  },
  ["featured-bills-list"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS],
  }
);
