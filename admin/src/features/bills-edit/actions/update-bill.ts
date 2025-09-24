"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateBillCache } from "@/lib/utils/cache-invalidation";
import { type BillUpdateInput, billUpdateSchema } from "../types";

export async function updateBill(id: string, input: BillUpdateInput) {
  try {
    // 管理者権限チェック
    await requireAdmin();

    // バリデーション
    const validatedData = billUpdateSchema.parse(input);

    // Supabaseで更新
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("bills")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(`議案の更新に失敗しました: ${error.message}`);
    }

    // web側のキャッシュを無効化
    await invalidateBillCache();
  } catch (error) {
    console.error("Update bill error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("議案の更新中にエラーが発生しました");
  }

  // 成功したら一覧ページへリダイレクト
  redirect("/bills");
}
