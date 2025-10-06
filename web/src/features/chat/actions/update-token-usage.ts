"use server";

import { createClient } from "@/lib/supabase/server";
import { DAILY_TOKEN_LIMIT } from "../constants/token-limits";

export async function updateTokenUsage(
  userId: string,
  inputTokens: number,
  outputTokens: number
) {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const totalTokens = inputTokens + outputTokens;

  // 今日の使用量を取得
  const { data: current, error: fetchError } = await supabase
    .from("user_token_usage")
    .select("token_used")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (fetchError || !current) {
    // レコードが存在しない場合は作成
    if (fetchError?.code === "PGRST116") {
      const { error: insertError } = await supabase
        .from("user_token_usage")
        .insert({
          user_id: userId,
          date: today,
          token_used: totalTokens,
          token_limit: DAILY_TOKEN_LIMIT,
        });

      if (insertError) {
        console.error("Failed to create token usage:", insertError);
        throw insertError;
      }

      return { success: true, tokensAdded: totalTokens };
    }

    throw new Error("Today's token usage record not found");
  }

  // 使用量を更新 (null チェック付き)
  const currentUsed = current.token_used || 0;
  const { error } = await supabase
    .from("user_token_usage")
    .update({
      token_used: currentUsed + totalTokens,
    })
    .eq("user_id", userId)
    .eq("date", today);

  if (error) {
    console.error("Failed to update token usage:", error);
    throw error;
  }

  return { success: true, tokensAdded: totalTokens };
}
