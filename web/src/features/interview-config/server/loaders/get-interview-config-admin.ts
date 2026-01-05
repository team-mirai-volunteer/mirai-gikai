import type { Database } from "@mirai-gikai/supabase";
import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type InterviewConfig =
  Database["public"]["Tables"]["interview_configs"]["Row"];

export async function getInterviewConfigAdmin(
  billId: string
): Promise<InterviewConfig | null> {
  return _getCachedInterviewConfigAdmin(billId);
}

const _getCachedInterviewConfigAdmin = unstable_cache(
  async (billId: string): Promise<InterviewConfig | null> => {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("interview_configs")
      .select("*")
      .eq("bill_id", billId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Failed to fetch interview config (admin):", error);
      return null;
    }

    return data;
  },
  ["interview-config-admin"],
  {
    revalidate: 60, // 非公開設定をプレビューするので短めに
    tags: [CACHE_TAGS.BILLS],
  }
);
