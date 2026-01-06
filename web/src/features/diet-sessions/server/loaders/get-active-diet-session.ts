import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { DietSession } from "../../shared/types";

/**
 * アクティブな国会会期を取得
 * is_active = true の会期を返す
 * アクティブな会期がない場合は、最新の会期（start_date降順で最初）にフォールバック
 */
export async function getActiveDietSession(): Promise<DietSession | null> {
  return _getCachedActiveDietSession();
}

const _getCachedActiveDietSession = unstable_cache(
  async (): Promise<DietSession | null> => {
    const supabase = createAdminClient();

    // まずアクティブな会期を取得
    const { data: activeSession, error: activeError } = await supabase
      .from("diet_sessions")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (activeError) {
      console.error("Failed to fetch active diet session:", activeError);
      return null;
    }

    if (activeSession) {
      return activeSession;
    }

    // アクティブな会期がない場合は最新の会期にフォールバック
    const { data: latestSession, error: latestError } = await supabase
      .from("diet_sessions")
      .select("*")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
      console.error("Failed to fetch latest diet session:", latestError);
      return null;
    }

    return latestSession;
  },
  ["active-diet-session"],
  {
    revalidate: 3600, // 1 hour
    tags: [CACHE_TAGS.DIET_SESSIONS],
  }
);
