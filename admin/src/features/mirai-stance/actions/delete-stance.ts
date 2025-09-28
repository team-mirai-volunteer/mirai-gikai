"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { invalidateBillCache } from "@/lib/utils/cache-invalidation";

export async function deleteStance(stanceId: string) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("mirai_stances")
      .delete()
      .eq("id", stanceId);

    if (error) {
      console.error("Error deleting stance:", error);
      throw new Error("スタンスの削除に失敗しました");
    }

    invalidateBillCache();
    return { success: true };
  } catch (error) {
    console.error("Error in deleteStance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました",
    };
  }
}
