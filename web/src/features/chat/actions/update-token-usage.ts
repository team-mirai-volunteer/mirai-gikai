"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateTokenUsage(
  userId: string,
  inputTokens: number,
  outputTokens: number
) {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const totalTokens = inputTokens + outputTokens;

  // 今日の使用量を取得
  const { data: current } = await supabase
    .from("user_token_usage")
    .select("token_used")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (!current) {
    throw new Error("Today's token usage record not found");
  }

  // 使用量を更新
  const { error } = await supabase
    .from("user_token_usage")
    .update({
      token_used: current.token_used + totalTokens,
    })
    .eq("user_id", userId)
    .eq("date", today);

  if (error) {
    console.error("Failed to update token usage:", error);
    throw error;
  }

  return { success: true, tokensAdded: totalTokens };
}
