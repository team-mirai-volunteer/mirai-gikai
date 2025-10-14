"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import { type BillCreateInput, billCreateSchema } from "../types";

export async function createBill(input: BillCreateInput) {
  try {
    // 管理者権限チェック
    await requireAdmin();

    // バリデーション
    const validatedData = billCreateSchema.parse(input);

    const insertData = {
      ...validatedData,
      published_at: validatedData.published_at
        ? new Date(validatedData.published_at).toISOString()
        : null,
    };

    // Supabaseに挿入
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("bills")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      throw new Error(`議案の作成に失敗しました: ${error.message}`);
    }

    // web側のキャッシュを無効化
    await invalidateWebCache();
  } catch (error) {
    console.error("Create bill error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("議案の作成中にエラーが発生しました");
  }

  // 成功したら一覧ページへリダイレクト
  redirect("/bills");
}
