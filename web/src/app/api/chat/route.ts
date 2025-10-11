import {
  convertToModelMessages,
  simulateReadableStream,
  streamText,
  type UIMessage,
} from "ai";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import type { BillWithContent } from "@/features/bills/types";
import { createPromptProvider, type CompiledPrompt } from "@/lib/prompt";
import { DAILY_CHAT_TOKEN_LIMIT } from "@/features/chat/constants";
import { getDailyLangfuseTokenUsage } from "@/features/chat/lib/langfuse-usage";
import { getChatSupabaseUser } from "@/features/chat/lib/supabase-server";

async function _mockResponse(_req: Request) {
  const randomMessageId = Math.random().toString(36).substring(2, 10);
  return new Response(
    simulateReadableStream({
      initialDelayInMs: 1000, // 最初の遅延
      chunkDelayInMs: 200, // 各チャンク間の遅延
      chunks: [
        `data: {"type":"start","messageId":"${randomMessageId}"}\n\n`,
        `data: {"type":"text-start","id":"text-1"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"本日は、生成AIに関する新しい取り組みが"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"各地で発表されました。"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":" 特に注目を集めているのは、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"日本語に最適化された大規模言語モデルで、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"従来に比べて大幅に精度が向上しています。"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":" 研究者によれば、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"長文生成だけでなく要約や推論の分野でも"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"高いパフォーマンスを示しており、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"ビジネスや教育の現場での活用が"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"期待されています。"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":" また、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"国内のスタートアップ企業も積極的に"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"この分野に参入しており、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"今後数年で市場は急速に拡大する見込みです。"}\n\n`,
        `data: {"type":"text-end","id":"text-1"}\n\n`,
        `data: {"type":"finish"}\n\n`,
        `data: [DONE]\n\n`,
      ],
    }).pipeThrough(new TextEncoderStream()),
    {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    }
  );
}

export async function POST(req: Request) {
  const {
    messages,
  }: {
    messages: UIMessage<{
      billContext: BillWithContent;
      difficultyLevel: string;
    }>;
  } = await req.json();

  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    return new Response(
      JSON.stringify({
        error: "Anonymous session required",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const usage = await getDailyLangfuseTokenUsage(user.id);

  if (usage.isLimitReached) {
    return new Response(
      JSON.stringify({
        error: "Token limit reached",
        totalTokens: usage.totalTokens,
        remainingTokens: usage.remainingTokens,
        tokenLimit: DAILY_CHAT_TOKEN_LIMIT,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  // Extract bill context and difficulty level from the first user message data if available
  const billContext = messages[0]?.metadata?.billContext;
  const difficultyLevel = (messages[0]?.metadata?.difficultyLevel ||
    "normal") as DifficultyLevelEnum;
  const promptProvider = createPromptProvider();

  // 難易度に応じたプロンプト名を決定
  const promptName = `bill-chat-system-${difficultyLevel}`;

  // Langfuseからプロンプト取得
  let promptResult: CompiledPrompt;
  try {
    promptResult = await promptProvider.getPrompt(promptName, {
      billName: billContext?.name || "",
      billTitle: billContext?.bill_content?.title || "",
      billSummary: billContext?.bill_content?.summary || "",
      billContent: billContext?.bill_content?.content || "",
    });
  } catch (error) {
    console.error("Prompt fetch error:", error);
    return new Response(
      JSON.stringify({
        error: "プロンプトの取得に失敗しました",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Vercel AI SDKでストリーミング生成
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
        metadata: {
          langfusePrompt: promptResult.metadata,
          billId: billContext?.id || "",
          difficultyLevel,
          userId: user.id,
        },
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("LLM generation error:", error);
    return new Response(
      JSON.stringify({
        error: "応答の生成に失敗しました",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
