import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { DietSession } from "../../shared/types";

/**
 * 前回の国会会期を取得
 * 最新のセッション（start_date順）から2番目のセッションを返す
 * 2つ以上のセッションがない場合はnullを返す
 */
export async function getPreviousDietSession(): Promise<DietSession | null> {
  return _getCachedPreviousDietSession();
}

const _getCachedPreviousDietSession = unstable_cache(
  async (): Promise<DietSession | null> => {
    const supabase = createAdminClient();

    // 最新2件のセッションを取得
    const { data, error } = await supabase
      .from("diet_sessions")
      .select("*")
      .order("start_date", { ascending: false })
      .limit(2);

    if (error) {
      console.error("Failed to fetch previous diet session:", error);
      return null;
    }

    // 2つ以上のセッションがない場合はnullを返す
    if (!data || data.length < 2) {
      return null;
    }

    // 2番目のセッション（前回のセッション）を返す
    return data[1];
  },
  ["previous-diet-session"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.DIET_SESSIONS],
  }
);
