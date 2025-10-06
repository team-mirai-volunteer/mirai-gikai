"use server";

import { createClient } from "@/lib/supabase/server";
import { DAILY_TOKEN_LIMIT } from "../constants/token-limits";

export async function ensureAnonymousUser() {
  const supabase = await createClient();

  // 既存セッションチェック
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return { userId: session.user.id, isNew: false };
  }

  // 匿名ユーザー作成
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(`Anonymous auth failed: ${error.message}`);
  }

  // user_token_usageレコード作成
  await initializeUserTokenUsage(data.user.id);

  return { userId: data.user.id, isNew: true };
}

async function initializeUserTokenUsage(userId: string) {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const { error } = await supabase.from("user_token_usage").insert({
    user_id: userId,
    date: today,
    token_used: 0,
    token_limit: DAILY_TOKEN_LIMIT,
  });

  if (error) {
    console.error("Failed to initialize token usage:", error);
  }
}
