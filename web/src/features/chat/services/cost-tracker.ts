import "server-only";

import type { Database } from "@mirai-gikai/supabase";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { LanguageModelUsage } from "ai";

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

type ModelPricing = {
  inputTokensPerMillionUsd: number;
  outputTokensPerMillionUsd: number;
};

const MODEL_PRICING: Record<string, ModelPricing> = {
  "openai/gpt-4o": {
    inputTokensPerMillionUsd: 2.5,
    outputTokensPerMillionUsd: 10,
  },
  "openai/gpt-4o-mini": {
    inputTokensPerMillionUsd: 0.15,
    outputTokensPerMillionUsd: 0.6,
  },
};

const COST_DECIMALS = 6;
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
    cost_usd: formatCost(costUsdNumber),
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

function calculateUsageCostUsd(model: string, usage: SanitizedUsage): number {
  const pricing = MODEL_PRICING[model];

  if (!pricing) {
    console.warn(
      `No pricing information found for model "${model}". Treating usage cost as 0.`
    );
    return 0;
  }

  const inputCost =
    (pricing.inputTokensPerMillionUsd * usage.inputTokens) / 1_000_000;
  const outputCost =
    (pricing.outputTokensPerMillionUsd * usage.outputTokens) / 1_000_000;

  return inputCost + outputCost;
}

type SanitizedUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

function sanitizeUsage(usage?: LanguageModelUsage): SanitizedUsage {
  const inputTokens = usage?.inputTokens ?? 0;
  const outputTokens = usage?.outputTokens ?? 0;
  const totalTokens =
    usage?.totalTokens ??
    (Number.isFinite(inputTokens + outputTokens)
      ? inputTokens + outputTokens
      : 0);

  return {
    inputTokens: ensureInteger(inputTokens),
    outputTokens: ensureInteger(outputTokens),
    totalTokens: ensureInteger(totalTokens),
  };
}

function ensureInteger(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

function formatCost(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  const scale = 10 ** COST_DECIMALS;
  return Math.round(value * scale) / scale;
}

function parseCost(row: Pick<ChatUsageRow, "cost_usd">): number {
  const value = Number(row.cost_usd);
  return Number.isFinite(value) ? value : 0;
}
