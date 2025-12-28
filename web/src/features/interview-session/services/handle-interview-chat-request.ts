import "server-only";

import { convertToModelMessages, Output, streamText } from "ai";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import { getInterviewConfig } from "@/features/interview-config/api/get-interview-config";
import { getInterviewQuestions } from "@/features/interview-config/api/get-interview-questions";
import { createInterviewSession } from "@/features/interview-session/actions/create-interview-session";
import { getInterviewSession } from "@/features/interview-session/api/get-interview-session";
import {
  interviewChatTextSchema,
  interviewChatWithReportSchema,
} from "@/features/interview-session/types/schemas";
import {
  buildInterviewSystemPrompt,
  buildSummarySystemPrompt,
} from "../lib/build-interview-system-prompt";
import { saveInterviewMessage } from "./save-interview-message";

type InterviewChatRequestParams = {
  messages: { role: string; content: string }[];
  billId: string;
  currentStage: "chat" | "summary" | "summary_complete";
};

/**
 * インタビューチャットリクエストを処理してストリーミングレスポンスを返す
 */
export async function handleInterviewChatRequest({
  messages,
  billId,
  currentStage,
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
  const session =
    (await getInterviewSession(interviewConfig.id)) ??
    (await createInterviewSession({ interviewConfigId: interviewConfig.id }));

  // 最新のメッセージを取得
  const lastMessage = messages[messages.length - 1];
  const isSummaryPhase = currentStage === "summary";

  // ユーザーメッセージを保存
  if (lastMessage?.role === "user") {
    const userMessageText = lastMessage.content;

    if (userMessageText.trim()) {
      await saveInterviewMessage({
        sessionId: session.id,
        role: "user",
        content: userMessageText,
      });
    }
  }

  // システムプロンプトを構築
  const systemPrompt = isSummaryPhase
    ? buildSummarySystemPrompt({ bill, interviewConfig })
    : buildInterviewSystemPrompt({
        bill,
        interviewConfig,
        questions: await getInterviewQuestions(interviewConfig.id),
      });

  // ストリーミングレスポンスを生成
  return generateStreamingResponse({
    systemPrompt,
    messages,
    sessionId: session.id,
    isSummaryPhase,
  });
}

/**
 * ストリーミングレスポンスを生成
 */
async function generateStreamingResponse({
  systemPrompt,
  messages,
  sessionId,
  isSummaryPhase,
}: {
  systemPrompt: string;
  messages: { role: string; content: string }[];
  sessionId: string;
  isSummaryPhase: boolean;
}) {
  const model = "openai/gpt-4o-mini";
  const schema = isSummaryPhase
    ? interviewChatWithReportSchema
    : interviewChatTextSchema;

  const handleError = (error: unknown) => {
    console.error("LLM generation error:", error);
    throw new Error(
      `LLM generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  };

  const handleFinish = async (event: { text?: string }) => {
    try {
      if (event.text) {
        // event.textは既にJSON文字列（summaryフェーズ）またはプレーンテキスト
        await saveInterviewMessage({
          sessionId,
          role: "assistant",
          content: event.text,
        });
      }
    } catch (err) {
      console.error("Failed to save interview message:", err);
    }
  };

  const uiMessages = messages.map((message) => ({
    role: message.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: message.content }],
  }));

  const streamParams = {
    model,
    system: systemPrompt,
    messages: await convertToModelMessages(uiMessages),
    onError: handleError,
    onFinish: handleFinish,
  } as const;

  try {
    if (isSummaryPhase) {
      const result = streamText({
        ...streamParams,
        output: Output.object({ schema: interviewChatWithReportSchema }),
      });
      return result.toTextStreamResponse();
    }

    const result = streamText({
      ...streamParams,
      output: Output.object({ schema: interviewChatTextSchema }),
    });
    return result.toTextStreamResponse();
  } catch (error) {
    handleError(error);
    throw error;
  }
}
