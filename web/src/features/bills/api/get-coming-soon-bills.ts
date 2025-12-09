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

    const { data, error } = await supabase
      .from("bills")
      .select("id, name, originating_house, shugiin_url")
      .eq("publish_status", "coming_soon")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch coming soon bills:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data;
  },
  ["coming-soon-bills-list"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS],
  }
);
