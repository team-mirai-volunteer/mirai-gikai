import type { LanguageModelUsage } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@mirai-gikai/supabase";

import { DAILY_TOKEN_LIMIT } from "../constants/token-limits";
import { getTokensUsed, logTokenUsage } from "./token-usage";

type SupabaseDatabaseClient = SupabaseClient<Database>;

export type ChatUsageRecord = {
  tokenUsed: number;
  tokenRemaining: number;
};

type EnsureUsageOptions = {
  supabase: SupabaseDatabaseClient;
  userId: string;
  dateKey: string;
};

type ApplyUsageOptions = EnsureUsageOptions & {
  totalUsage?: LanguageModelUsage | null;
  currentUsage: ChatUsageRecord;
};

const adaptUsageRecord = (row: {
  token_used: number;
  token_remaining: number;
}): ChatUsageRecord => ({
  tokenUsed: row.token_used,
  tokenRemaining: row.token_remaining,
});

export async function ensureChatUsageRecord({
  supabase,
  userId,
  dateKey,
}: EnsureUsageOptions): Promise<ChatUsageRecord> {
  const { data, error } = await supabase
    .from("chat_users")
    .select("token_used, token_remaining")
    .eq("id", userId)
    .eq("date", dateKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch chat usage: ${error.message}`);
  }

  if (data) {
    return adaptUsageRecord(data);
  }

  const initialUsage = {
    id: userId,
    date: dateKey,
    token_used: 0,
    token_remaining: DAILY_TOKEN_LIMIT,
  };

  const { error: insertError } = await supabase
    .from("chat_users")
    .insert(initialUsage);

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: existingRecord, error: fetchError } = await supabase
        .from("chat_users")
        .select("token_used, token_remaining")
        .eq("id", userId)
        .eq("date", dateKey)
        .maybeSingle();

      if (fetchError) {
        throw new Error(
          `Failed to resolve duplicate chat usage insert: ${fetchError.message}`
        );
      }

      if (existingRecord) {
        return adaptUsageRecord(existingRecord);
      }
    }

    throw new Error(
      `Failed to initialize usage tracking: ${insertError.message}`
    );
  }

  return {
    tokenUsed: initialUsage.token_used,
    tokenRemaining: initialUsage.token_remaining,
  };
}

export async function applyChatUsageDelta({
  supabase,
  userId,
  dateKey,
  totalUsage,
  currentUsage,
}: ApplyUsageOptions): Promise<ChatUsageRecord> {
  logTokenUsage(totalUsage);

  const tokensUsedNow = getTokensUsed(totalUsage);

  if (!tokensUsedNow) {
    return currentUsage;
  }

  const tokenUsed = currentUsage.tokenUsed + tokensUsedNow;
  const tokenRemaining = Math.max(currentUsage.tokenRemaining - tokensUsedNow, 0);

  const { error } = await supabase
    .from("chat_users")
    .update({
      token_used: tokenUsed,
      token_remaining: tokenRemaining,
    })
    .eq("id", userId)
    .eq("date", dateKey);

  if (error) {
    throw new Error(`Failed to update usage tracking: ${error.message}`);
  }

  return {
    tokenUsed,
    tokenRemaining,
  };
}

