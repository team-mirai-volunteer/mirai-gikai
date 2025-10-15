import { simulateReadableStream, type UIMessage } from "ai";
import { getChatSupabaseUser } from "@/features/chat/lib/supabase-server";
import {
  type ChatMessageMetadata,
  handleChatRequest,
} from "@/features/chat/services/handle-chat-request";
import { ChatError, ChatErrorCode } from "@/features/chat/types/errors";
import { registerNodeTelemetry } from "@/lib/telemetry/register";

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
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[API:${requestId}] Received POST request to /api/chat`, {
    environment: process.env.VERCEL_ENV || "development",
    nodeVersion: process.version,
    platform: process.platform,
  });

  // Vercel node環境でinstrumentationが自動で起動しない問題対応
  // 明示的にtelemetryを初期化
  console.log(`[API:${requestId}] Initializing telemetry...`);
  await registerNodeTelemetry();
  console.log(`[API:${requestId}] Telemetry initialized`);

  console.log(`[API:${requestId}] Parsing request body...`);
  const { messages }: { messages: UIMessage<ChatMessageMetadata>[] } =
    await req.json();
  console.log(`[API:${requestId}] Request body parsed:`, {
    messageCount: messages.length,
  });

  console.log(`[API:${requestId}] Getting Supabase user...`);
  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    console.log(`[API:${requestId}] User authentication failed:`, {
      error: getUserError,
    });
    return new Response(
      JSON.stringify({
        error: "Anonymous session required",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log(`[API:${requestId}] User authenticated:`, {
    userId: user.id,
  });

  try {
    console.log(`[API:${requestId}] Calling handleChatRequest...`);
    const response = await handleChatRequest({ messages, userId: user.id });
    console.log(`[API:${requestId}] handleChatRequest completed successfully`);
    return response;
  } catch (error) {
    console.error(`[API:${requestId}] Chat request error:`, {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // レートリミットエラー
    if (
      error instanceof ChatError &&
      error.code === ChatErrorCode.DAILY_COST_LIMIT_REACHED
    ) {
      return new Response(
        "本日の利用上限に達しました。明日0時以降に再度お試しください。",
        {
          status: 429,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }
      );
    }

    // その他のChatError
    if (error instanceof ChatError) {
      return new Response(
        "エラーが発生しました。しばらく待ってから再度お試しください。",
        {
          status: 500,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }
      );
    }

    // 予期しないエラー
    return new Response(
      "エラーが発生しました。しばらく待ってから再度お試しください。",
      {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }
}
