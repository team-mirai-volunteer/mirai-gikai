import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";

interface SaveInterviewMessageParams {
  sessionId: string;
  role: "assistant" | "user";
  content: string;
}

/**
 * インタビューメッセージをDBに保存
 */
export async function saveInterviewMessage({
  sessionId,
  role,
  content,
}: SaveInterviewMessageParams): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("interview_messages").insert({
    interview_session_id: sessionId,
    role,
    content,
  });

  if (error) {
    console.error("Failed to save interview message:", error);
    throw new Error(`Failed to save interview message: ${error.message}`);
  }
}
