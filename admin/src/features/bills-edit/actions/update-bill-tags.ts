"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateBillCache } from "@/lib/utils/cache-invalidation";

/**
 * 議案のタグを更新する
 * 既存のタグをすべて削除してから、新しいタグを登録する
 */
export async function updateBillTags(billId: string, tagIds: string[]) {
  await requireAdmin();

  const supabase = createAdminClient();

  try {
    // 既存のタグをすべて削除
    const { error: deleteError } = await supabase
      .from("bills_tags")
      .delete()
      .eq("bill_id", billId);

    if (deleteError) {
      return {
        success: false,
        error: `タグの削除に失敗しました: ${deleteError.message}`,
      };
    }

    // 新しいタグを登録
    if (tagIds.length > 0) {
      const billTags = tagIds.map((tagId) => ({
        bill_id: billId,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase
        .from("bills_tags")
        .insert(billTags);

      if (insertError) {
        return {
          success: false,
          error: `タグの登録に失敗しました: ${insertError.message}`,
        };
      }
    }

    // キャッシュを更新
    await invalidateBillCache();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `タグの更新中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    };
  }
}
