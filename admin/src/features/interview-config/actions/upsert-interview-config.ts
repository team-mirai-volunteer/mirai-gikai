"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import { type InterviewConfigInput, interviewConfigSchema } from "../types";

export type InterviewConfigResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

/**
 * 新しいインタビュー設定を作成する
 */
export async function createInterviewConfig(
  billId: string,
  input: InterviewConfigInput
): Promise<InterviewConfigResult> {
  try {
    await requireAdmin();

    // バリデーション
    const validatedData = interviewConfigSchema.parse(input);

    const supabase = createAdminClient();

    // 新規作成
    const { data, error } = await supabase
      .from("interview_configs")
      .insert({
        bill_id: billId,
        name: validatedData.name,
        status: validatedData.status,
        themes: validatedData.themes || null,
        knowledge_source: validatedData.knowledge_source || null,
      })
      .select()
      .single();

    if (error) {
      // publicステータスの重複エラーを検出
      if (error.code === "23505" && error.message.includes("bill_public")) {
        return {
          success: false,
          error:
            "この法案にはすでに公開中の設定があります。公開できる設定は1つのみです。",
        };
      }
      return {
        success: false,
        error: `インタビュー設定の作成に失敗しました: ${error.message}`,
      };
    }

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { success: true, data: { id: data.id } };
  } catch (error) {
    console.error("Create interview config error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "インタビュー設定の作成中にエラーが発生しました",
    };
  }
}

/**
 * 既存のインタビュー設定を更新する
 */
export async function updateInterviewConfig(
  configId: string,
  input: InterviewConfigInput
): Promise<InterviewConfigResult> {
  try {
    await requireAdmin();

    // バリデーション
    const validatedData = interviewConfigSchema.parse(input);

    const supabase = createAdminClient();

    // 更新
    const { data, error } = await supabase
      .from("interview_configs")
      .update({
        name: validatedData.name,
        status: validatedData.status,
        themes: validatedData.themes || null,
        knowledge_source: validatedData.knowledge_source || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", configId)
      .select()
      .single();

    if (error) {
      // publicステータスの重複エラーを検出
      if (error.code === "23505" && error.message.includes("bill_public")) {
        return {
          success: false,
          error:
            "この法案にはすでに公開中の設定があります。公開できる設定は1つのみです。",
        };
      }
      return {
        success: false,
        error: `インタビュー設定の更新に失敗しました: ${error.message}`,
      };
    }

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { success: true, data: { id: data.id } };
  } catch (error) {
    console.error("Update interview config error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "インタビュー設定の更新中にエラーが発生しました",
    };
  }
}

/**
 * インタビュー設定を削除する
 */
export async function deleteInterviewConfig(
  configId: string
): Promise<InterviewConfigResult> {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("interview_configs")
      .delete()
      .eq("id", configId);

    if (error) {
      return {
        success: false,
        error: `インタビュー設定の削除に失敗しました: ${error.message}`,
      };
    }

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { success: true, data: { id: configId } };
  } catch (error) {
    console.error("Delete interview config error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "インタビュー設定の削除中にエラーが発生しました",
    };
  }
}
