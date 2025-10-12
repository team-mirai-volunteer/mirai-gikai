"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { StanceInput } from "../types";

export async function updateStance(stanceId: string, data: StanceInput) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("mirai_stances")
      .update({
        type: data.type,
        comment: data.comment || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", stanceId);

    if (error) {
      console.error("Error updating stance:", error);
      throw new Error("スタンスの更新に失敗しました");
    }

    invalidateWebCache();
    return { success: true };
  } catch (error) {
    console.error("Error in updateStance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました",
    };
  }
}
