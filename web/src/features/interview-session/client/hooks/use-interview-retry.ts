import { useRef, useState } from "react";
import type { InterviewChatRequestParams } from "@/features/interview-session/shared/types";
import type { ConversationMessage } from "../utils/message-utils";

const MAX_AUTO_RETRIES = 1;

export function useInterviewRetry() {
  const retryCount = useRef(0);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null
  );
  const [displayError, setDisplayError] = useState<Error | null>(null);
  const lastFailedRequestParams = useRef<InterviewChatRequestParams | null>(
    null
  );

  /**
   * リクエストパラメータを保存（リトライ用）
   */
  const saveRequestParams = (params: InterviewChatRequestParams) => {
    lastFailedRequestParams.current = params;
  };

  /**
   * エラー発生時の処理（自動リトライ判定）
   * @returns true: 自動リトライ実行, false: 手動リトライ待ち
   */
  const handleError = (
    error: Error,
    conversationMessagesRef: React.RefObject<ConversationMessage[]>,
    submit: (params: InterviewChatRequestParams) => void
  ): boolean => {
    console.error("chat error", error);
    console.log(retryCount.current, lastFailedRequestParams.current);

    // 自動リトライ判定（1回まで）
    if (
      retryCount.current < MAX_AUTO_RETRIES &&
      lastFailedRequestParams.current
    ) {
      console.log(
        `[Auto Retry] Attempt ${retryCount.current + 1}/${MAX_AUTO_RETRIES}`
      );
      retryCount.current += 1;

      // リトライフラグを付けて自動再送信
      submit({
        ...lastFailedRequestParams.current,
        isRetry: true,
      });
      return true; // 自動リトライ実行
    }

    // 自動リトライ上限に達した場合は手動リトライ用に保存
    const lastUserMsg =
      conversationMessagesRef.current?.[
        conversationMessagesRef.current.length - 1
      ];
    console.log("Last user message:", lastUserMsg);
    if (lastUserMsg?.role === "user") {
      setLastFailedMessage(lastUserMsg.content);
    }
    // エラーを表示用stateに保存
    setDisplayError(
      new Error("エラーが発生しました。もう一度お試しください。")
    );
    return false; // 手動リトライ待ち
  };

  /**
   * 成功時のリセット
   */
  const resetRetry = () => {
    retryCount.current = 0;
    setLastFailedMessage(null);
    setDisplayError(null);
    lastFailedRequestParams.current = null;
  };

  /**
   * 手動リトライの実行
   */
  const executeRetry = (
    params: InterviewChatRequestParams,
    submit: (params: InterviewChatRequestParams) => void
  ) => {
    retryCount.current = 0;
    setDisplayError(null);
    lastFailedRequestParams.current = params;
    submit(params);
    setLastFailedMessage(null);
  };

  return {
    // State
    displayError,
    lastFailedMessage,
    canRetry: !!lastFailedMessage,

    // Actions
    saveRequestParams,
    handleError,
    resetRetry,
    executeRetry,
  };
}
