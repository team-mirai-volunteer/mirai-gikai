"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useMemo, useState } from "react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { InterviewReportData } from "@/features/interview-session/types/schemas";
import { interviewChatResponseSchema } from "@/features/interview-session/types/schemas";
import {
  callCompleteApi,
  callFacilitateApi,
} from "../lib/interview-api-client";
import {
  buildMessagesForApi,
  buildMessagesForFacilitator,
  type ConversationMessage,
  convertPartialReport,
  parseMessageContent,
} from "../lib/message-utils";

export type InterviewStage = "chat" | "summary" | "summary_complete";

interface UseInterviewChatProps {
  billId: string;
  interviewConfigId: string;
  sessionId: string;
  initialMessages: Array<{
    id: string;
    role: "assistant" | "user";
    content: string;
    created_at: string;
    report?: InterviewReportData | null;
  }>;
}

export function useInterviewChat({
  billId,
  interviewConfigId,
  sessionId,
  initialMessages,
}: UseInterviewChatProps) {
  // 初期メッセージをパースして、textとreportに分離
  const parsedInitialMessages = useMemo(
    () =>
      initialMessages.map((msg) => {
        if (msg.role === "assistant") {
          const { text, report } = parseMessageContent(msg.content);
          return { ...msg, content: text, report: msg.report ?? report };
        }
        return msg;
      }),
    [initialMessages]
  );

  const [input, setInput] = useState("");
  const [stage, setStage] = useState<InterviewStage>("chat");
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);

  // 完了処理の状態
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completedReportId, setCompletedReportId] = useState<string | null>(
    null
  );

  // useObjectフックを使用（streamObjectの結果を受け取る）
  const { object, submit, isLoading, error } = useObject({
    api: "/api/interview/chat",
    schema: interviewChatResponseSchema,
    onFinish: ({ object: finishedObject, error: finishedError }) => {
      if (finishedError) {
        console.error("chat error", finishedError);
        return;
      }
      if (finishedObject) {
        const { text, report } = finishedObject;
        setConversationMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: text ?? "",
            report: convertPartialReport(report),
          },
        ]);
      }
    },
  });

  // objectからreportを取得
  const streamingReportData = convertPartialReport(object?.report);

  // チャットAPI送信のヘルパー
  const submitChatMessage = (
    userMessageText: string,
    currentStage: InterviewStage
  ) => {
    submit({
      messages: buildMessagesForApi(
        parsedInitialMessages,
        conversationMessages,
        userMessageText
      ),
      billId,
      currentStage,
    });
  };

  // メッセージ送信
  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    if (!hasText || isLoading || stage === "summary_complete") {
      return;
    }

    const userMessageText = message.text ?? "";
    const userMessageId = `user-${Date.now()}`;

    // ユーザーメッセージを会話履歴に追加
    setConversationMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", content: userMessageText },
    ]);
    setInput("");

    // summaryフェーズではファシリテーターを呼ばず、直接チャットAPIを呼ぶ
    if (stage === "summary") {
      submitChatMessage(userMessageText, "summary");
      return;
    }

    // 通常のチャットフェーズでは、送信前にファシリテーターAPIを同期呼び出し
    const metadata = {
      interviewSessionId: sessionId,
      interviewConfigId,
      billId,
      currentStage: "chat" as const,
    };

    const facilitatorResult = await callFacilitateApi({
      messages: buildMessagesForFacilitator(
        parsedInitialMessages,
        conversationMessages,
        { id: userMessageId, content: userMessageText },
        metadata
      ),
      billId,
      currentStage: "chat",
    });

    if (facilitatorResult?.status === "summary") {
      setStage("summary");
      submitChatMessage(userMessageText, "summary");
      return;
    }

    // 通常のチャットフェーズでのメッセージ送信
    submitChatMessage(userMessageText, "chat");
  };

  // インタビュー完了処理
  const handleAgree = async () => {
    setIsCompleting(true);
    setCompleteError(null);
    try {
      const result = await callCompleteApi({
        sessionId,
        interviewConfigId,
        billId,
      });
      setCompletedReportId(result.report?.id || null);
      setStage("summary_complete");
    } catch (err) {
      setCompleteError(
        err instanceof Error ? err.message : "Failed to complete interview"
      );
    } finally {
      setIsCompleting(false);
    }
  };

  // ストリーミング中のメッセージが会話履歴に追加済みかどうか
  const isStreamingMessageCommitted =
    object &&
    conversationMessages.some(
      (m) => m.role === "assistant" && m.content === object.text
    );

  return {
    // 状態
    input,
    setInput,
    stage,
    parsedInitialMessages,
    conversationMessages,
    isLoading,
    error,
    object,
    streamingReportData,
    isStreamingMessageCommitted,

    // 完了処理の状態
    isCompleting,
    completeError,
    completedReportId,

    // アクション
    handleSubmit,
    handleAgree,
  };
}
