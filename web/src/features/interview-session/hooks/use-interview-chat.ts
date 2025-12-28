"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { interviewChatResponseSchema } from "@/features/interview-session/types/schemas";
import { callFacilitateApi } from "../lib/interview-api-client";
import {
  buildMessagesForApi,
  buildMessagesForFacilitator,
  type ConversationMessage,
  convertPartialReport,
} from "../lib/message-utils";
import { useInterviewCompletion } from "./use-interview-completion";
import { type InitialMessage, useParsedMessages } from "./use-parsed-messages";
import { useQuickReplies } from "./use-quick-replies";

export type InterviewStage = "chat" | "summary" | "summary_complete";

interface UseInterviewChatProps {
  billId: string;
  interviewConfigId: string;
  sessionId: string;
  initialMessages: InitialMessage[];
}

export function useInterviewChat({
  billId,
  interviewConfigId,
  sessionId,
  initialMessages,
}: UseInterviewChatProps) {
  // 初期メッセージのパース
  const { parsedInitialMessages, initialStage } =
    useParsedMessages(initialMessages);

  // 基本状態
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<InterviewStage>(initialStage);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);

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
        const { text, report, quick_replies } = finishedObject;
        setConversationMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: text ?? "",
            report: convertPartialReport(report),
            quickReplies: quick_replies ?? [],
          },
        ]);
      }
    },
  });

  // 完了処理
  const { isCompleting, completeError, completedReportId, handleAgree } =
    useInterviewCompletion({
      sessionId,
      interviewConfigId,
      billId,
      onComplete: () => setStage("summary_complete"),
    });

  // クイックリプライ
  const currentQuickReplies = useQuickReplies({
    conversationMessages,
    parsedInitialMessages,
    isLoading,
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
    const facilitatorResult = await callFacilitateApi({
      messages: buildMessagesForFacilitator(
        parsedInitialMessages,
        conversationMessages,
        { content: userMessageText }
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

  // クイックリプライを選択した時の処理
  const handleQuickReply = (reply: string) => {
    handleSubmit({ text: reply });
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
    currentQuickReplies,

    // 完了処理の状態
    isCompleting,
    completeError,
    completedReportId,

    // アクション
    handleSubmit,
    handleAgree,
    handleQuickReply,
  };
}
