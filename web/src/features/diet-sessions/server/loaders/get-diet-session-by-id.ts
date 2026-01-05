import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { DietSession } from "../../shared/types";

/**
 * IDで国会会期を取得
 */
export async function getDietSessionById(
  id: string
): Promise<DietSession | null> {
  return _getCachedDietSessionById(id);
}

const _getCachedDietSessionById = unstable_cache(
  async (id: string): Promise<DietSession | null> => {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("diet_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch diet session by id:", error);
      return null;
    }

    return data;
  },
  ["diet-session-by-id"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.DIET_SESSIONS],
  }
);
