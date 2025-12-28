"use client";

import { useMemo } from "react";
import type { ConversationMessage } from "../lib/message-utils";
import type { ParsedInitialMessage } from "./use-parsed-messages";

interface UseQuickRepliesProps {
  conversationMessages: ConversationMessage[];
  parsedInitialMessages: ParsedInitialMessage[];
  isLoading: boolean;
}

/**
 * 最新のAIメッセージからクイックリプライを取得するフック
 */
export function useQuickReplies({
  conversationMessages,
  parsedInitialMessages,
  isLoading,
}: UseQuickRepliesProps) {
  const currentQuickReplies = useMemo(() => {
    // ストリーミング中は表示しない
    if (isLoading) return [];

    // 新規会話履歴の最新AIメッセージからquickRepliesを取得
    const lastAssistantMessage = [...conversationMessages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (lastAssistantMessage?.quickReplies?.length) {
      return lastAssistantMessage.quickReplies;
    }

    // 新規会話がない場合は初期メッセージから取得
    if (conversationMessages.length === 0) {
      const lastInitialAssistant = [...parsedInitialMessages]
        .reverse()
        .find((m) => m.role === "assistant");
      if (lastInitialAssistant?.quickReplies?.length) {
        return lastInitialAssistant.quickReplies;
      }
    }

    return [];
  }, [conversationMessages, parsedInitialMessages, isLoading]);

  return currentQuickReplies;
}
