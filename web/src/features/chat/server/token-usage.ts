"use server";

import { DAILY_TOKEN_LIMIT } from "../constants/token-limits";
import { getTodayJstDate } from "../lib/date";
import type {
  TokenUsage,
  TokenUsageCheckResult,
  TokenUsageUpdatePayload,
} from "../types";
import { createSupabaseServerClient } from "./anonymous-auth";

export async function ensureTokenUsageRecord(userId: string): Promise<TokenUsage> {
  const supabase = await createSupabaseServerClient();
  const today = getTodayJstDate();

  const { data, error, status } = await supabase
    .from("user_token_usage")
    .select("token_used, token_limit")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (error && status !== 406) {
    throw new Error(`Failed to fetch token usage: ${error.message}`);
  }

  if (data) {
    return {
      tokenLimit: data.token_limit,
      tokenUsed: data.token_used,
      tokenRemaining: data.token_limit - data.token_used,
    };
  }

  const insertResult = await supabase
    .from("user_token_usage")
    .insert({
      user_id: userId,
      date: today,
      token_limit: DAILY_TOKEN_LIMIT,
      token_used: 0,
    })
    .select("token_limit, token_used")
    .single();

  if (insertResult.error) {
    throw new Error(
      `Failed to initialize token usage: ${insertResult.error.message}`
    );
  }

  return {
    tokenLimit: insertResult.data.token_limit,
    tokenUsed: insertResult.data.token_used,
    tokenRemaining:
      insertResult.data.token_limit - insertResult.data.token_used,
  };
}

export async function checkTokenLimit(
  userId: string
): Promise<TokenUsageCheckResult> {
  const supabase = await createSupabaseServerClient();
  const today = getTodayJstDate();

  const { data, error, status } = await supabase
    .from("user_token_usage")
    .select("token_used, token_limit")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (error && status !== 406) {
    return {
      canUse: false,
      usage: {
        tokenLimit: DAILY_TOKEN_LIMIT,
        tokenUsed: 0,
        tokenRemaining: DAILY_TOKEN_LIMIT,
      },
      error: error.message,
    };
  }

  const tokenUsed = data?.token_used ?? 0;
  const tokenLimit = data?.token_limit ?? DAILY_TOKEN_LIMIT;
  const tokenRemaining = Math.max(tokenLimit - tokenUsed, 0);

  return {
    canUse: tokenRemaining > 0,
    usage: { tokenLimit, tokenUsed, tokenRemaining },
  };
}

export async function updateTokenUsage(
  userId: string,
  payload: TokenUsageUpdatePayload
) {
  const supabase = await createSupabaseServerClient();
  const today = getTodayJstDate();
  const totalTokens = payload.inputTokens + payload.outputTokens;

  const { data: current, error: fetchError, status } = await supabase
    .from("user_token_usage")
    .select("token_used")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (fetchError && status !== 406) {
    throw new Error(`Failed to fetch token usage: ${fetchError.message}`);
  }

  const existingTokenUsed = current?.token_used ?? 0;

  const { error } = await supabase
    .from("user_token_usage")
    .update({ token_used: existingTokenUsed + totalTokens })
    .eq("user_id", userId)
    .eq("date", today);

  if (error) {
    throw new Error(`Failed to update token usage: ${error.message}`);
  }
}

