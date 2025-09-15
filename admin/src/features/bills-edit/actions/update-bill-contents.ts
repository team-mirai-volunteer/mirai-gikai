"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  billContentsUpdateSchema,
  type BillContentsUpdateInput,
  type DifficultyLevel,
} from "../types/bill-contents";
import { requireAdmin } from "@/features/auth/lib/auth-server";

export async function updateBillContents(
  billId: string,
  input: BillContentsUpdateInput
) {
  try {
    // 管理者権限チェック
    await requireAdmin();

    // バリデーション
    const validatedData = billContentsUpdateSchema.parse(input);

    // Supabaseで更新
    const supabase = createAdminClient();

    // 各難易度レベルのupsertを並行実行
    const upsertPromises = (
      ["easy", "normal", "hard"] as DifficultyLevel[]
    ).map(async (difficulty) => {
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
    });

    await Promise.all(upsertPromises);

    // キャッシュをリフレッシュ
    revalidatePath("/bills");
    revalidatePath(`/bills/${billId}/contents/edit`);
  } catch (error) {
    console.error("Update bill contents error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("議案コンテンツの更新中にエラーが発生しました");
  }

  // 成功したら一覧ページへリダイレクト
  redirect("/bills");
}
