import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { ComingSoonBill } from "../../shared/types";

/**
 * Coming Soon議案を取得する
 * publish_status = 'coming_soon' の議案を取得
 */
export async function getComingSoonBills(): Promise<ComingSoonBill[]> {
  // キャッシュ外でcookiesにアクセス
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedComingSoonBills(difficultyLevel);
}

const _getCachedComingSoonBills = unstable_cache(
  async (difficultyLevel: DifficultyLevelEnum): Promise<ComingSoonBill[]> => {
    const supabase = createAdminClient();

    // bill_contentsからタイトルも取得（指定された難易度レベルを使用）
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

    // bill_contentsからtitleを抽出（ユーザーの難易度設定を使用）
    return data.map((bill) => {
      const contents = bill.bill_contents as Array<{
        title: string;
        difficulty_level: string;
      }> | null;

      // ユーザーが選択した難易度のコンテンツを優先
      const preferredContent = contents?.find(
        (c) => c.difficulty_level === difficultyLevel
      );
      // フォールバック: normalを優先、それもなければ任意のコンテンツ
      const fallbackContent =
        contents?.find((c) => c.difficulty_level === "normal") || contents?.[0];

      return {
        id: bill.id,
        name: bill.name,
        title: preferredContent?.title || fallbackContent?.title || null,
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
