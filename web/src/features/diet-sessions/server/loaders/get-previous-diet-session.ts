import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { DietSession } from "../../shared/types";

/**
 * 前回の国会会期を取得
 * アクティブなセッションより古いセッションを返す
 * アクティブなセッションがない場合、または古いセッションがない場合はnullを返す
 */
export async function getPreviousDietSession(): Promise<DietSession | null> {
  return _getCachedPreviousDietSession();
}

const _getCachedPreviousDietSession = unstable_cache(
  async (): Promise<DietSession | null> => {
    const supabase = createAdminClient();

    // まずアクティブなセッションを取得
    const { data: activeSession, error: activeError } = await supabase
      .from("diet_sessions")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (activeError) {
      console.error("Failed to fetch active diet session:", activeError);
      return null;
    }

    // アクティブなセッションがない場合はnullを返す
    if (!activeSession) {
      return null;
    }

    // アクティブなセッションより古いセッションを取得（start_dateで比較）
    const { data: previousSession, error: previousError } = await supabase
      .from("diet_sessions")
      .select("*")
      .lt("start_date", activeSession.start_date)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (previousError) {
      console.error("Failed to fetch previous diet session:", previousError);
      return null;
    }

    return previousSession;
  },
  ["previous-diet-session"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.DIET_SESSIONS],
  }
);
