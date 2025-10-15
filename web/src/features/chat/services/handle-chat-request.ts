import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import type { BillWithContent } from "@/features/bills/types";
import { ChatError, ChatErrorCode } from "@/features/chat/types/errors";
import { env } from "@/lib/env";
import {
  type CompiledPrompt,
  createPromptProvider,
  type PromptProvider,
} from "@/lib/prompt";

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
 *
 * NOTE: Web検索機能は実験的実装です。
 * gpt-4oのweb_searchツールを使用して最新情報を取得します。
 */
export async function handleChatRequest({
  messages,
  userId,
}: ChatRequestParams) {
  const requestId = generateRequestId();
  console.log(`[Chat:${requestId}] Starting chat request`, {
    userId,
    messageCount: messages.length,
    environment: process.env.VERCEL_ENV || "development",
  });

  const promptProvider = createPromptProvider();

  // Check cost limit before processing
  console.log(`[Chat:${requestId}] Checking cost limit...`);
  const isWithinLimit = await isWithinCostLimit(userId, promptProvider);
  if (!isWithinLimit) {
    console.log(`[Chat:${requestId}] Cost limit exceeded for user ${userId}`);
    throw new ChatError(ChatErrorCode.DAILY_COST_LIMIT_REACHED);
  }
  console.log(`[Chat:${requestId}] Cost limit check passed`);

  // Extract context from messages
  const context = extractChatContext(messages);
  console.log(`[Chat:${requestId}] Extracted context:`, {
    pageType: context.pageContext?.type,
    hasBillContext: !!context.billContext,
    difficultyLevel: context.difficultyLevel,
  });

  // Build prompt configuration
  console.log(`[Chat:${requestId}] Building prompt...`);
  const { promptName, promptResult } = await buildPrompt(
    context,
    promptProvider
  );
  console.log(`[Chat:${requestId}] Prompt built:`, {
    promptName,
    promptLength: promptResult.content.length,
  });

  // Generate streaming response
  try {
    console.log(
      `[Chat:${requestId}] Initializing streamText with web_search tool...`,
      {
        openaiApiKeyConfigured: !!process.env.OPENAI_API_KEY,
        messageCount: messages.length,
      }
    );
    // NOTE: OpenAI web search requires the Responses API
    // Use openai.responses() instead of openai() for the model
    const useWebSearch = process.env.ENABLE_WEB_SEARCH !== "false";
    console.log(`[Chat:${requestId}] Web search enabled:`, useWebSearch);

    const result = streamText({
      // OpenAI Responses API supports web_search tool
      // gpt-4o with Responses API - Context 128K Input Tokens $2.50/M Output Tokens $10.00/M
      // gpt-4o-mini with Responses API - Context 128K Input Tokens $0.15/M Output Tokens $0.60/M
      model: openai("gpt-4o"),
      system: buildSystemPromptWithSearchInstruction(promptResult.content),
      messages: convertToModelMessages(messages),
      ...(useWebSearch && {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: {
          web_search: openai.tools.webSearch() as any,
        },
      }),
      experimental_telemetry: {
        isEnabled: true,
        functionId: promptName,
        metadata: buildTelemetryMetadata(context, promptResult, userId),
      },
      onChunk: ({ chunk }) => {
        // Log different chunk types for debugging
        if (chunk.type === "tool-call") {
          console.log(`[Chat:${requestId}] Tool call:`, {
            type: chunk.type,
            toolName: chunk.toolName,
            toolCallId: chunk.toolCallId,
            // @ts-expect-error - input/args property may vary
            input: chunk.input || chunk.args,
          });
        } else if (chunk.type === "tool-result") {
          // @ts-expect-error - output/result property may vary
          const output = chunk.output || chunk.result;
          console.log(`[Chat:${requestId}] Tool result:`, {
            type: chunk.type,
            toolName: chunk.toolName,
            toolCallId: chunk.toolCallId,
            output:
              typeof output === "string"
                ? output.substring(0, 300)
                : JSON.stringify(output).substring(0, 300),
          });
        } else if (chunk.type === "text-delta") {
          // Don't log every text delta to avoid noise
        } else {
          console.log(`[Chat:${requestId}] Chunk:`, {
            type: chunk.type,
          });
        }
      },
      onFinish: ({ text, finishReason, usage, toolCalls, toolResults }) => {
        console.log(`[Chat:${requestId}] Stream finished:`, {
          finishReason,
          textLength: text.length,
          generatedText: text,
          usage,
          toolCallsCount: toolCalls?.length || 0,
          toolResultsCount: toolResults?.length || 0,
          toolCalls: toolCalls?.map((tc) => ({
            toolName: tc.toolName,
            toolCallId: tc.toolCallId,
          })),
        });
      },
    });

    console.log(`[Chat:${requestId}] Converting to UI message stream...`);
    const response = result.toUIMessageStreamResponse();
    console.log(`[Chat:${requestId}] Response created successfully`);
    return response;
  } catch (error) {
    console.error(`[Chat:${requestId}] LLM generation error:`, {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new ChatError(
      ChatErrorCode.LLM_GENERATION_FAILED,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * リクエストIDを生成（ログ追跡用）
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 10);
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
 * Web検索の指示をシステムプロンプトに追加
 */
function buildSystemPromptWithSearchInstruction(basePrompt: string): string {
  const searchInstruction = `

## Web検索の使用について
- あなたの知識カットオフ（2025年1月）以降の情報や、知らない情報については積極的にWeb検索を使用してください
- 最新の政治動向、法案の審議状況、統計データ、ニュースなど時事的な情報が必要な場合は検索してください
- 検索結果を使用する場合は、必ず引用元のURLを明記してください
- 検索すれば分かる内容でも、政治や政策・チームみらいに関係ない内容については答えないようにしてください。
`;

  return basePrompt + searchInstruction;
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
