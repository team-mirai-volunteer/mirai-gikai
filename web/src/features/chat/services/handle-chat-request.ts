import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { after } from "next/server";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import type { BillWithContent } from "@/features/bills/types";
import { ChatError, ChatErrorCode } from "@/features/chat/types/errors";
import { env } from "@/lib/env";
import {
  type CompiledPrompt,
  createPromptProvider,
  type PromptProvider,
} from "@/lib/prompt";
import { flushTelemetry } from "../../../../instrumentation.node";

export type ChatMessageMetadata = {
  billContext?: BillWithContent;
  pageContext?: {
    type: "home" | "bill";
    bills?: Array<{ id: string; name: string; summary?: string }>;
  };
  difficultyLevel: DifficultyLevelEnum;
};

type ChatRequestParams = {
  messages: UIMessage<ChatMessageMetadata>[];
  userId: string;
};

/**
 * チャットリクエストを処理してストリーミングレスポンスを返す
 */
export async function handleChatRequest({
  messages,
  userId,
}: ChatRequestParams) {
  const promptProvider = createPromptProvider();

  // Check cost limit before processing
  const isWithinLimit = await isWithinCostLimit(userId, promptProvider);
  if (!isWithinLimit) {
    throw new ChatError(ChatErrorCode.DAILY_COST_LIMIT_REACHED);
  }

  // Extract context from messages
  const context = extractChatContext(messages);

  // Build prompt configuration
  const { promptName, promptResult } = await buildPrompt(
    context,
    promptProvider
  );

  // Generate streaming response
  try {
    const result = streamText({
      model: "openai/gpt-4o-mini",
      // "openai/gpt-5-mini" Context 400K Input Tokens $0.25/M Output Tokens $2.00/M Cache Read Tokens $0.03/M
      // "openai/gpt-4o-mini" Context 128K Input Tokens $0.15/M Output Tokens $0.60/M Cache Read Tokens $0.07/M
      // "deepseek/deepseek-v3.1" Context 164K Input Tokens $0.20/M Output Tokens $0.80/M
      system: promptResult.content,
      messages: convertToModelMessages(messages),
      experimental_telemetry: {
        isEnabled: true,
        functionId: promptName,
        metadata: buildTelemetryMetadata(context, promptResult, userId),
      },
    });

    // Flush telemetry data after response is sent (important for serverless environments)
    after(async () => {
      await flushTelemetry();
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("LLM generation error:", error);
    throw new ChatError(
      ChatErrorCode.LLM_GENERATION_FAILED,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * メッセージから最初のメタデータを抽出してコンテキストを作成
 */
function extractChatContext(
  messages: UIMessage<ChatMessageMetadata>[]
): ChatMessageMetadata {
  const metadata = messages[0]?.metadata;
  return {
    billContext: metadata?.billContext,
    pageContext: metadata?.pageContext,
    difficultyLevel: (metadata?.difficultyLevel ||
      "normal") as DifficultyLevelEnum,
  };
}

/**
 * ユーザーがコストリミット内かどうかを判定
 */
async function isWithinCostLimit(
  userId: string,
  promptProvider: PromptProvider
): Promise<boolean> {
  const jstDayRange = getJstDayRange();
  const usedCost = await promptProvider.getUsageCostUsd(
    userId,
    jstDayRange.from,
    jstDayRange.to
  );
  const limitCost = env.chat.dailyCostLimitUsd;

  return usedCost < limitCost;
}

/**
 * コンテキストに基づいてプロンプトを組み立てる
 */
async function buildPrompt(
  context: ChatMessageMetadata,
  promptProvider: PromptProvider
) {
  // Determine prompt name
  const promptName =
    context.pageContext?.type === "home"
      ? "top-chat-system"
      : `bill-chat-system-${context.difficultyLevel}`;

  // Prepare prompt variables
  const variables: Record<string, string> =
    context.pageContext?.type === "home"
      ? { billSummary: JSON.stringify(context.pageContext.bills ?? "") }
      : {
          billName: context.billContext?.name ?? "",
          billTitle: context.billContext?.bill_content?.title ?? "",
          billSummary: context.billContext?.bill_content?.summary ?? "",
          billContent: context.billContext?.bill_content?.content ?? "",
        };

  // Fetch prompt from Langfuse
  try {
    const promptResult = await promptProvider.getPrompt(promptName, variables);
    return { promptName, promptResult };
  } catch (error) {
    console.error("Prompt fetch error:", error);
    throw new ChatError(
      ChatErrorCode.PROMPT_FETCH_FAILED,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * JST基準の1日の時間範囲を取得（UTC形式で返す）
 */
function getJstDayRange(): { from: string; to: string } {
  const now = new Date();
  const jstOffsetMs = 9 * 60 * 60 * 1000;
  const jstNow = new Date(now.getTime() + jstOffsetMs);

  const startOfJstDay = new Date(
    Date.UTC(
      jstNow.getUTCFullYear(),
      jstNow.getUTCMonth(),
      jstNow.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );

  const startUtc = new Date(startOfJstDay.getTime() - jstOffsetMs);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);

  return {
    from: startUtc.toISOString(),
    to: endUtc.toISOString(),
  };
}

/**
 * テレメトリメタデータを構築
 */
function buildTelemetryMetadata(
  context: ChatMessageMetadata,
  promptResult: CompiledPrompt,
  userId: string
) {
  return {
    langfusePrompt: promptResult.metadata,
    billId: context.billContext?.id || "",
    pageType: context.pageContext?.type || "bill",
    difficultyLevel: context.difficultyLevel,
    userId,
  };
}
