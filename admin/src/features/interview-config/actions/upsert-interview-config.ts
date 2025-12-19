"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import { type InterviewConfigInput, interviewConfigSchema } from "../types";

export type UpsertInterviewConfigResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

export async function upsertInterviewConfig(
  billId: string,
  input: InterviewConfigInput
): Promise<UpsertInterviewConfigResult> {
  try {
    await requireAdmin();

    // バリデーション
    const validatedData = interviewConfigSchema.parse(input);

    const supabase = createAdminClient();

    // upsert実行
    const { data, error } = await supabase
      .from("interview_configs")
      .upsert(
        {
          bill_id: billId,
          status: validatedData.status,
          themes: validatedData.themes || null,
          knowledge_source: validatedData.knowledge_source || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "bill_id",
        }
      )
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `インタビュー設定の保存に失敗しました: ${error.message}`,
      };
    }

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { success: true, data: { id: data.id } };
  } catch (error) {
    console.error("Upsert interview config error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "インタビュー設定の保存中にエラーが発生しました",
    };
  }
}
