import type { UIMessage } from "ai";
import { getChatSupabaseUser } from "@/features/chat/lib/supabase-server";
import { handleInterviewChatRequest } from "@/features/interview-session/services/handle-interview-chat-request";
import type { InterviewChatMetadata } from "@/features/interview-session/types";
import { registerNodeTelemetry } from "@/lib/telemetry/register";

export async function POST(req: Request) {
  // Vercel node環境でinstrumentationが自動で起動しない問題対応
  // 明示的にtelemetryを初期化
  await registerNodeTelemetry();

  const {
    messages,
    billId,
  }: {
    messages: UIMessage<InterviewChatMetadata>[];
    billId: string;
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
    return await handleInterviewChatRequest({
      messages,
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
