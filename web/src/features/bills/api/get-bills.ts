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

    const billIds = data.map((item) => item.id);
    const { data: allBillTags } = await supabase
      .from("bills_tags")
      .select("bill_id, tags(id, label)")
      .in("bill_id", billIds);

    const tagsByBillId = groupTagsByBillId(allBillTags ?? []);

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
  ["bills-list"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS],
  }
);

function groupTagsByBillId(
  billTags: Array<{
    bill_id: string;
    tags: { id: string; label: string } | null;
  }>
): Map<string, Array<{ id: string; label: string }>> {
  return billTags.reduce((acc, bt) => {
    if (bt.tags) {
      const existing = acc.get(bt.bill_id) ?? [];
      acc.set(bt.bill_id, [...existing, bt.tags]);
    }
    return acc;
  }, new Map<string, Array<{ id: string; label: string }>>());
}
