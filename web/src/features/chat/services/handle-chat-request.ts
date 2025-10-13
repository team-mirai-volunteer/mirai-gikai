import { convertToModelMessages, streamText, type UIMessage } from "ai";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import type { BillWithContent } from "@/features/bills/types";
import { type CompiledPrompt, createPromptProvider } from "@/lib/prompt";

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
  // Check usage cost before processing
  const promptProvider = createPromptProvider();
  const jstDayRange = getJstDayRange();
  const usageCost = await promptProvider.getUsageCostUsd(
    userId,
    jstDayRange.from,
    jstDayRange.to
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Daily Usage Cost Report");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`👤 User ID: ${userId}`);
  console.log(`💰 Total Cost (Today): $${usageCost.toFixed(4)} USD`);
  console.log(`📅 Period: ${jstDayRange.from} ~ ${jstDayRange.to}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Extract context from messages
  const context = extractChatContext(messages);

  // Build prompt configuration
  const { promptName, promptResult } = await buildPrompt(context);

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

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("LLM generation error:", error);
    throw new Error(
      `応答の生成に失敗しました: ${error instanceof Error ? error.message : String(error)}`
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
 * コンテキストに基づいてプロンプトを組み立てる
 */
async function buildPrompt(context: ChatMessageMetadata) {
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
  const promptProvider = createPromptProvider();
  try {
    const promptResult = await promptProvider.getPrompt(promptName, variables);
    return { promptName, promptResult };
  } catch (error) {
    console.error("Prompt fetch error:", error);
    throw new Error(
      `プロンプトの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
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
