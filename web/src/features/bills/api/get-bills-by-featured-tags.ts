import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillsByTag } from "../types";

/**
 * Featured表示用の議案をタグごとにグループ化して取得
 * featured_priorityが設定されているタグを持つ議案を優先度順に取得
 */
export async function getBillsByFeaturedTags(): Promise<BillsByTag[]> {
  // キャッシュ外でcookiesにアクセス
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedBillsByFeaturedTags(difficultyLevel);
}

const _getCachedBillsByFeaturedTags = unstable_cache(
  async (difficultyLevel: DifficultyLevelEnum): Promise<BillsByTag[]> => {
    const supabase = createAdminClient();

    // featured_priorityが設定されているタグを取得
    const { data: featuredTags, error: tagsError } = await supabase
      .from("tags")
      .select("id, label, featured_priority")
      .not("featured_priority", "is", null)
      .order("featured_priority", { ascending: true });

    if (tagsError) {
      console.error("Failed to fetch featured tags:", tagsError);
      return [];
    }

    if (!featuredTags || featuredTags.length === 0) {
      return [];
    }

    // 各タグの議案を並列で取得
    const results = await Promise.all(
      featuredTags.map(async (tag) => {
        const { data, error } = await supabase
          .from("bills_tags")
          .select(
            `
            bill_id,
            bills!inner (
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
            )
            `
          )
          .eq("tag_id", tag.id)
          .eq("bills.publish_status", "published")
          .eq("bills.bill_contents.difficulty_level", difficultyLevel);

        if (error) {
          console.error(`Failed to fetch bills for tag ${tag.label}:`, error);
          return null;
        }

        if (!data || data.length === 0) {
          return null;
        }

        // データを整形
        const bills = data
          .map((item) => {
            const billData = item.bills;
            if (!billData) return null;

            const { bill_contents, ...bill } = billData;
            const billContent = Array.isArray(bill_contents)
              ? bill_contents[0]
              : undefined;

            return {
              ...bill,
              bill_content: billContent,
              tags: [{ id: tag.id, label: tag.label }],
            };
          })
          .filter((bill): bill is NonNullable<typeof bill> => bill !== null);

        if (bills.length === 0) {
          return null;
        }

        return {
          tag: {
            id: tag.id,
            label: tag.label,
            priority: tag.featured_priority ?? -1,
          },
          bills,
        };
      })
    );

    // nullを除外して返す
    return results.filter(
      (result): result is NonNullable<typeof result> => result !== null
    );
  },
  ["featured-bills-list"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS],
  }
);
