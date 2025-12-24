import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { convertToModelMessages, Output, streamText, type UIMessage } from "ai";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import { getInterviewConfig } from "@/features/interview-config/api/get-interview-config";
import { getInterviewQuestions } from "@/features/interview-config/api/get-interview-questions";
import { createInterviewSession } from "@/features/interview-session/actions/create-interview-session";
import { getInterviewSession } from "@/features/interview-session/api/get-interview-session";
import type { InterviewChatMetadata } from "@/features/interview-session/types";
import {
  interviewChatTextSchema,
  interviewChatWithReportSchema,
} from "@/features/interview-session/types/schemas";
import {
  buildInterviewSystemPrompt,
  buildSummarySystemPrompt,
} from "../lib/build-interview-system-prompt";

type InterviewChatRequestParams = {
  messages: UIMessage<InterviewChatMetadata>[];
  billId: string;
};

/**
 * インタビューチャットリクエストを処理してストリーミングレスポンスを返す
 */
export async function handleInterviewChatRequest({
  messages,
  billId,
}: InterviewChatRequestParams) {
  // インタビュー設定と法案情報を取得
  const [interviewConfig, bill] = await Promise.all([
    getInterviewConfig(billId),
    getBillById(billId),
  ]);

  if (!interviewConfig) {
    throw new Error("Interview config not found");
  }

  // セッション取得または作成
  let session = await getInterviewSession(interviewConfig.id);
  if (!session) {
    session = await createInterviewSession({
      interviewConfigId: interviewConfig.id,
    });
  }

  // 最新のメッセージを取得（ユーザーの送信メッセージ）
  const lastMessage = messages[messages.length - 1];

  // summaryフェーズかどうかを判定（最新メッセージのmetadataのcurrentStageで判定）
  const isSummaryPhase = lastMessage?.metadata?.currentStage === "summary";

  // プロンプトを構築（summaryフェーズの場合は要約用プロンプトを使用）
  let systemPrompt: string;
  if (isSummaryPhase) {
    // 要約用プロンプト
    systemPrompt = buildSummarySystemPrompt({
      bill,
      interviewConfig,
    });
  } else {
    // 通常のインタビュー用プロンプト
    const questions = await getInterviewQuestions(interviewConfig.id);
    systemPrompt = buildInterviewSystemPrompt({
      bill,
      interviewConfig,
      questions,
    });
  }
  if (lastMessage && lastMessage.role === "user") {
    // ユーザーメッセージを保存
    const userMessageText = lastMessage.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("");

    if (userMessageText.trim()) {
      await saveInterviewMessage({
        sessionId: session.id,
        role: "user",
        content: userMessageText,
      });
    }
  }

  const model = "openai/gpt-4o-mini";

  // Generate streaming response
  // フェーズに応じて異なるスキーマを使用
  try {
    if (isSummaryPhase) {
      // summaryフェーズ: reportを含むスキーマを使用
      const result = streamText({
        model,
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        output: Output.object({ schema: interviewChatWithReportSchema }),
        onError: (error) => {
          console.error("LLM generation error:", error);
          throw new Error(
            `LLM generation failed: ${error instanceof Error ? error.message : String(error)}`
          );
        },
        onFinish: async (event) => {
          try {
            if (event.text) {
              // reportを含むJSON文字列として保存
              await saveInterviewMessage({
                sessionId: session.id,
                role: "assistant",
                content: JSON.stringify(event.text, null, 2),
              });
            }
          } catch (usageError) {
            console.error("Failed to save interview message:", usageError);
          }
        },
      });

      return result.toTextStreamResponse();
    }

    // 通常チャットフェーズ: reportがオプショナルなスキーマを使用
    const result = streamText({
      model,
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      output: Output.object({ schema: interviewChatTextSchema }),

      onError: (error) => {
        console.error("LLM generation error:", error);
        throw new Error(
          `LLM generation failed: ${error instanceof Error ? error.message : String(error)}`
        );
      },
      onFinish: async (event) => {
        try {
          if (event.text) {
            await saveInterviewMessage({
              sessionId: session.id,
              role: "assistant",
              content: event.text,
            });
          }
        } catch (usageError) {
          console.error("Failed to save interview message:", usageError);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("LLM generation error:", error);
    throw new Error(
      `LLM generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * インタビューメッセージを保存
 */
async function saveInterviewMessage({
  sessionId,
  role,
  content,
}: {
  sessionId: string;
  role: "assistant" | "user";
  content: string;
}): Promise<void> {
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
