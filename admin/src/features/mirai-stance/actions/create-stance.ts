"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { StanceInput } from "../types";

export async function createStance(billId: string, data: StanceInput) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("mirai_stances").insert({
      bill_id: billId,
      type: data.type,
      comment: data.comment || null,
    });

    if (error) {
      console.error("Error creating stance:", error);
      throw new Error("スタンスの作成に失敗しました");
    }

    invalidateWebCache();
    return { success: true };
  } catch (error) {
    console.error("Error in createStance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました",
    };
  }
}
