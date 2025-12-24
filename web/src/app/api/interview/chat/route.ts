import type { UIMessage } from "ai";
import { getChatSupabaseUser } from "@/features/chat/lib/supabase-server";
import { handleInterviewChatRequest } from "@/features/interview-session/services/handle-interview-chat-request";
import type { InterviewChatMetadata } from "@/features/interview-session/types";
import { registerNodeTelemetry } from "@/lib/telemetry/register";

export async function POST(req: Request) {
  // Vercel node環境でinstrumentationが自動で起動しない問題対応
  // 明示的にtelemetryを初期化
  await registerNodeTelemetry();

  const body = await req.json();
  const {
    messages,
    billId,
    currentStage,
  }: {
    messages:
      | Array<{ role: string; content: string }>
      | UIMessage<InterviewChatMetadata>[];
    billId: string;
    currentStage?: "chat" | "summary" | "summary_complete";
  } = body;

  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    return new Response(
      JSON.stringify({
        error: "Anonymous session required",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!billId) {
    return new Response(
      JSON.stringify({
        error: "billId is required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // useObjectから送られてくる形式に合わせて変換
    const convertedMessages: UIMessage<InterviewChatMetadata>[] = messages.map(
      (m, index) => {
        if ("role" in m && "content" in m && !("parts" in m)) {
          // useObjectから送られてくる形式
          return {
            id: `msg-${index}`,
            role: m.role as "user" | "assistant",
            content: m.content,
            parts: [{ type: "text" as const, text: m.content }],
            metadata: {
              interviewSessionId: "",
              interviewConfigId: "",
              billId,
              currentStage,
            } as InterviewChatMetadata,
          };
        }
        // 既存のUIMessage形式
        return m as UIMessage<InterviewChatMetadata>;
      }
    );

    return await handleInterviewChatRequest({
      messages: convertedMessages,
      billId,
    });
  } catch (error) {
    console.error("Interview chat request error:", error);

    return new Response(
      error instanceof Error
        ? error.message
        : "エラーが発生しました。しばらく待ってから再度お試しください。",
      {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }
}
