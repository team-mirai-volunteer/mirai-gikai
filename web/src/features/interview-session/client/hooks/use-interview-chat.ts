"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { interviewChatResponseSchema } from "@/features/interview-session/shared/schemas";
import { callFacilitateApi } from "../utils/interview-api-client";
import {
  buildMessagesForApi,
  buildMessagesForFacilitator,
  type ConversationMessage,
  convertPartialReport,
} from "../utils/message-utils";
import { useInterviewRetry } from "./use-interview-retry";
import { type InitialMessage, useParsedMessages } from "./use-parsed-messages";
import { useQuickReplies } from "./use-quick-replies";

export type InterviewStage = "chat" | "summary" | "summary_complete";

interface UseInterviewChatProps {
  billId: string;
  initialMessages: InitialMessage[];
}

export function useInterviewChat({
  billId,
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
  const [isFacilitating, setIsFacilitating] = useState(false);

  // リトライロジック
  const retry = useInterviewRetry();

  // useObjectフックを使用（streamObjectの結果を受け取る）
  const { object, submit, isLoading, error } = useObject({
    api: "/api/interview/chat",
    schema: interviewChatResponseSchema,
    onFinish: ({ object: finishedObject, error: finishedError }) => {
      if (finishedError) {
        // リトライ処理を委譲
        const handled = retry.handleError(finishedError, submit);
        if (handled) return; // 自動リトライ実行済み
        return; // 手動リトライ待ち
      }

      // 成功時はリトライをリセット
      retry.resetRetry();

      if (finishedObject) {
        const { text, report, quick_replies, question_id } = finishedObject;
        const questionId = question_id ?? null;
        setConversationMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: text ?? "",
            report: convertPartialReport(report),
            quickReplies:
              questionId && Array.isArray(quick_replies) ? quick_replies : [],
            questionId,
          },
        ]);
      }
    },
  });

  // 統合ローディング状態（useObjectのisLoading + ファシリテーターAPI呼び出し中）
  const isChatLoading = isLoading || isFacilitating;

  // 完了時のコールバック（summary_completeへの遷移用）
  const handleComplete = (reportId: string | null) => {
    setStage("summary_complete");
    setCompletedReportId(reportId);
  };

  const [completedReportId, setCompletedReportId] = useState<string | null>(
    null
  );

  // 初期メッセージと会話履歴を統合
  const messages = [...parsedInitialMessages, ...conversationMessages];

  // クイックリプライ
  const currentQuickReplies = useQuickReplies({
    messages,
    isLoading: isChatLoading,
  });

  // objectからreportを取得
  const streamingReportData = convertPartialReport(object?.report);

  // チャットAPI送信のヘルパー（リクエストパラメータを保存）
  const submitChatMessage = (
    userMessageText: string,
    currentStage: InterviewStage
  ) => {
    const requestParams = {
      messages: buildMessagesForApi(
        parsedInitialMessages,
        conversationMessages,
        userMessageText
      ),
      billId,
      currentStage,
    };
    retry.saveRequestParams(requestParams); // 失敗時の自動リトライ用に保存
    submit(requestParams);
  };

  // メッセージ送信
  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    if (!hasText || isChatLoading || stage === "summary_complete") {
      return;
    }

    const userMessageText = message.text ?? "";
    const userMessageId = `user-${Date.now()}`;

    // ユーザーメッセージを会話履歴に追加
    setConversationMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: userMessageText,
      },
    ]);
    setInput("");

    // summaryフェーズではファシリテーターを呼ばず、直接チャットAPIを呼ぶ
    if (stage === "summary") {
      submitChatMessage(userMessageText, "summary");
      return;
    }

    // 通常のチャットフェーズでは、送信前にファシリテーターAPIを同期呼び出し
    setIsFacilitating(true);
    try {
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
    } finally {
      setIsFacilitating(false);
    }
  };

  // クイックリプライを選択した時の処理
  const handleQuickReply = (reply: string) => {
    handleSubmit({ text: reply });
  };

  // 手動リトライ関数
  const handleRetry = () => {
    if (!retry.canRetry) return;

    // 保存されたリクエストパラメータでリトライ
    retry.manualRetry(submit);
  };

  return {
    // 状態
    input,
    setInput,
    stage,
    messages,
    isLoading: isChatLoading,
    error: error || retry.displayError,
    object,
    streamingReportData,
    currentQuickReplies,
    completedReportId,
    canRetry: retry.canRetry,

    // アクション
    handleSubmit,
    handleQuickReply,
    handleComplete,
    handleRetry,
  };
}
