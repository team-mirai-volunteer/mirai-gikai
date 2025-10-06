"use server";

import { createClient } from "@/lib/supabase/server";
import { DAILY_TOKEN_LIMIT } from "../constants/token-limits";

export async function checkTokenLimit(userId: string) {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // 今日の日付のレコードを取得
  const { data, error } = await supabase
    .from("user_token_usage")
    .select("token_used, token_limit")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  let tokenUsed = 0;
  let tokenLimit = DAILY_TOKEN_LIMIT;

  if (error) {
    // レコードが存在しない場合、新規作成
    if (error.code === "PGRST116") {
      const { error: insertError } = await supabase
        .from("user_token_usage")
        .insert({
          user_id: userId,
          date: today,
          token_used: 0,
          token_limit: DAILY_TOKEN_LIMIT,
        });

      if (insertError) {
        console.error("Failed to create today's token usage:", insertError);
        return {
          canUse: false,
          remaining: 0,
          error: "Failed to create token usage",
        };
      }

      tokenUsed = 0;
      tokenLimit = DAILY_TOKEN_LIMIT;
    } else {
      return {
        canUse: false,
        remaining: 0,
        error: "Failed to fetch token usage",
      };
    }
  } else {
    tokenUsed = data.token_used;
    tokenLimit = data.token_limit;
  }

  const remaining = tokenLimit - tokenUsed;
  const canUse = remaining > 0;

  return { canUse, remaining, tokenUsed, tokenLimit };
}
