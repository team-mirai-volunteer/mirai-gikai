import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { ComingSoonBill } from "../types";

/**
 * Coming Soon議案を取得する
 * publish_status = 'coming_soon' の議案を取得
 */
export async function getComingSoonBills(): Promise<ComingSoonBill[]> {
  return _getCachedComingSoonBills();
}

const _getCachedComingSoonBills = unstable_cache(
  async (): Promise<ComingSoonBill[]> => {
    const supabase = createAdminClient();

    // bill_contentsからタイトルも取得（normalレベルを優先）
    const { data, error } = await supabase
      .from("bills")
      .select(
        `
        id,
        name,
        originating_house,
        shugiin_url,
        bill_contents (
          title,
          difficulty_level
        )
      `
      )
      .eq("publish_status", "coming_soon")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch coming soon bills:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // bill_contentsからtitleを抽出（normalを優先）
    return data.map((bill) => {
      const contents = bill.bill_contents as Array<{
        title: string;
        difficulty_level: string;
      }> | null;
      const normalContent = contents?.find(
        (c) => c.difficulty_level === "normal"
      );
      const anyContent = contents?.[0];

      return {
        id: bill.id,
        name: bill.name,
        title: normalContent?.title || anyContent?.title || null,
        originating_house: bill.originating_house,
        shugiin_url: bill.shugiin_url,
      };
    });
  },
  ["coming-soon-bills-list"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS],
  }
);
