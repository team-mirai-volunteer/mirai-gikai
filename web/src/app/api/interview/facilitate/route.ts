import type { UIMessage } from "ai";
import { getChatSupabaseUser } from "@/features/chat/lib/supabase-server";
import { facilitateInterview } from "@/features/interview-session/services/facilitate-interview";
import type { InterviewChatMetadata } from "@/features/interview-session/types";

export async function POST(req: Request) {
  const {
    messages,
    billId,
    currentStage,
  }: {
    messages: UIMessage<InterviewChatMetadata>[];
    billId: string;
    currentStage?: "chat" | "summary" | "summary_complete";
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
    const result = await facilitateInterview({
      messages,
      billId,
      currentStage,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Facilitate interview error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to facilitate interview",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
