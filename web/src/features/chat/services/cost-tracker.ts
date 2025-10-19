import "server-only";

import type { Database } from "@mirai-gikai/supabase";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { LanguageModelUsage } from "ai";

import {
  calculateUsageCostUsd,
  sanitizeUsage,
} from "@/lib/ai/calculate-ai-cost";

type ChatUsageInsert =
  Database["public"]["Tables"]["chat_usage_events"]["Insert"];
type ChatUsageRow = Database["public"]["Tables"]["chat_usage_events"]["Row"];

type RecordChatUsageParams = {
  userId: string;
  sessionId?: string;
  promptName?: string;
  model: string;
  usage?: LanguageModelUsage;
  occurredAt?: string;
  metadata?: ChatUsageInsert["metadata"];
};

export async function recordChatUsage({
  userId,
  sessionId,
  promptName,
  model,
  usage,
  occurredAt,
  metadata,
}: RecordChatUsageParams) {
  const supabase = createAdminClient();

  const sanitizedUsage = sanitizeUsage(usage);
  const costUsdNumber = calculateUsageCostUsd(model, sanitizedUsage);
  const payload: ChatUsageInsert = {
    user_id: userId,
    session_id: sessionId ?? null,
    prompt_name: promptName ?? null,
    model,
    input_tokens: sanitizedUsage.inputTokens,
    output_tokens: sanitizedUsage.outputTokens,
    total_tokens: sanitizedUsage.totalTokens,
    cost_usd: costUsdNumber,
    occurred_at: occurredAt,
    metadata: metadata ?? null,
  };

  const { error } = await supabase.from("chat_usage_events").insert(payload);

  if (error) {
    throw new Error(`Failed to record chat usage: ${error.message}`, {
      cause: error,
    });
  }
}

export async function getUsageCostUsd(
  userId: string,
  fromIso: string,
  toIso: string
): Promise<number> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("chat_usage_events")
    .select("cost_usd, occurred_at")
    .eq("user_id", userId)
    .gte("occurred_at", fromIso)
    .lt("occurred_at", toIso);

  if (error) {
    throw new Error(`Failed to fetch chat usage: ${error.message}`, {
      cause: error,
    });
  }

  return (data ?? []).reduce((acc, row) => acc + parseCost(row), 0);
}

function parseCost(row: Pick<ChatUsageRow, "cost_usd">): number {
  const value = Number(row.cost_usd);
  return Number.isFinite(value) ? value : 0;
}
