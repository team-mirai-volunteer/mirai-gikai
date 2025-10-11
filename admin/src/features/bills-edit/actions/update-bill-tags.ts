"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";

/**
 * 議案のタグを更新する
 * 既存のタグと新しいタグを比較して、差分のみを更新する
 */
export async function updateBillTags(billId: string, tagIds: string[]) {
  const supabase = createAdminClient();

  try {
    // 既存のタグIDを取得
    const { data: existingTags, error: fetchError } = await supabase
      .from("bills_tags")
      .select("tag_id")
      .eq("bill_id", billId);

    if (fetchError) {
      return {
        success: false,
        error: `既存タグの取得に失敗しました: ${fetchError.message}`,
      };
    }

    const existingTagIds = new Set(existingTags?.map((t) => t.tag_id) || []);
    const newTagIds = new Set(tagIds);

    // 削除すべきタグ
    const tagsToDelete = [...existingTagIds].filter((id) => !newTagIds.has(id));

    // 追加すべきタグ
    const tagsToAdd = [...newTagIds].filter((id) => !existingTagIds.has(id));

    // 削除処理
    if (tagsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("bills_tags")
        .delete()
        .eq("bill_id", billId)
        .in("tag_id", tagsToDelete);

      if (deleteError) {
        return {
          success: false,
          error: `タグの削除に失敗しました: ${deleteError.message}`,
        };
      }
    }

    // 追加処理
    if (tagsToAdd.length > 0) {
      const billTags = tagsToAdd.map((tagId) => ({
        bill_id: billId,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase
        .from("bills_tags")
        .insert(billTags);

      if (insertError) {
        return {
          success: false,
          error: `タグの追加に失敗しました: ${insertError.message}`,
        };
      }
    }

    // キャッシュを更新
    revalidatePath(`/bills/${billId}/edit`);
    revalidatePath("/bills");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `タグの更新中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    };
  }
}
