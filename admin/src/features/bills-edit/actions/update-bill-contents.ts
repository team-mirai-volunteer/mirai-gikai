"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import {
  type BillContentsUpdateInput,
  billContentsUpdateSchema,
  type DifficultyLevel,
} from "../types/bill-contents";

export type UpdateBillContentsResult =
  | { success: true }
  | { success: false; error: string };

export async function updateBillContents(
  billId: string,
  input: BillContentsUpdateInput
): Promise<UpdateBillContentsResult> {
  try {
    // 管理者権限チェック
    await requireAdmin();

    // バリデーション
    const validatedData = billContentsUpdateSchema.parse(input);

    // Supabaseで更新
    const supabase = createAdminClient();

    // 各難易度レベルのupsertを並行実行
    const upsertPromises = (["normal", "hard"] as DifficultyLevel[]).map(
      async (difficulty) => {
        const data = validatedData[difficulty];

        // 空のコンテンツの場合はスキップ（削除も行わない）
        if (!data.title && !data.summary && !data.content) {
          return;
        }

        const { error } = await supabase.from("bill_contents").upsert(
          {
            bill_id: billId,
            difficulty_level: difficulty,
            title: data.title || "",
            summary: data.summary || "",
            content: data.content || "",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "bill_id,difficulty_level",
          }
        );

        if (error) {
          throw new Error(
            `議案コンテンツ（${difficulty}）のupsertに失敗しました: ${error.message}`
          );
        }
      }
    );

    await Promise.all(upsertPromises);

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { success: true };
  } catch (error) {
    console.error("Update bill contents error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "議案コンテンツの更新中にエラーが発生しました";

    return { success: false, error: errorMessage };
  }
}
