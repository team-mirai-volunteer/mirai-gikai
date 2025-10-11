import "server-only";

import { getLangfuseClient } from "@/lib/prompt/langfuse/client";
import { DAILY_CHAT_TOKEN_LIMIT } from "../constants";

interface TokenUsageResult {
  totalTokens: number;
  remainingTokens: number;
  isLimitReached: boolean;
}

export async function getDailyLangfuseTokenUsage(userId: string): Promise<TokenUsageResult> {
  const { from, to } = getJstDayRange();

  try {
    const client = getLangfuseClient();
    const query = buildMetricsQuery(userId, from, to);
    const response = await client.api.metricsMetrics({
      query: JSON.stringify(query),
    });

    const totalTokens = extractTokenUsage(response?.data) ?? 0;
    const remainingTokens = Math.max(DAILY_CHAT_TOKEN_LIMIT - totalTokens, 0);

    return {
      totalTokens,
      remainingTokens,
      isLimitReached: remainingTokens <= 0,
    };
  } catch (error) {
    console.error("Langfuse token usage fetch failed", error);
    return {
      totalTokens: 0,
      remainingTokens: DAILY_CHAT_TOKEN_LIMIT,
      isLimitReached: false,
    };
  }
}

function buildMetricsQuery(userId: string, from: string, to: string) {
  return {
    view: "observations",
    metrics: [
      {
        measure: "usage.total",
        aggregation: "sum",
      },
    ],
    filters: [
      {
        column: "userId",
        operator: "=",
        value: userId,
      },
      {
        column: "type",
        operator: "=",
        value: "GENERATION",
      },
    ],
    fromTimestamp: from,
    toTimestamp: to,
  } satisfies Record<string, unknown>;
}

function extractTokenUsage(data: Record<string, unknown>[] | undefined): number | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const [firstEntry] = data;

  if (typeof firstEntry !== "object" || firstEntry === null) {
    return null;
  }

  if (typeof (firstEntry as { value?: unknown }).value === "number") {
    return (firstEntry as { value: number }).value;
  }

  const metrics = (firstEntry as { metrics?: unknown }).metrics;

  if (Array.isArray(metrics)) {
    for (const metric of metrics) {
      if (
        typeof metric === "object" &&
        metric !== null &&
        (metric as { measure?: unknown }).measure === "usage.total" &&
        typeof (metric as { value?: unknown }).value === "number"
      ) {
        return (metric as { value: number }).value;
      }
    }
  }

  return null;
}

function getJstDayRange(): { from: string; to: string } {
  const now = new Date();
  const jstOffsetMs = 9 * 60 * 60 * 1000;
  const jstNow = new Date(now.getTime() + jstOffsetMs);

  const startOfJstDay = new Date(Date.UTC(
    jstNow.getUTCFullYear(),
    jstNow.getUTCMonth(),
    jstNow.getUTCDate(),
    0,
    0,
    0,
    0
  ));

  const startUtc = new Date(startOfJstDay.getTime() - jstOffsetMs);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);

  return {
    from: startUtc.toISOString(),
    to: endUtc.toISOString(),
  };
}
