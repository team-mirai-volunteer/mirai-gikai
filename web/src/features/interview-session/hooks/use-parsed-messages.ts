"use client";

import { useMemo } from "react";
import { parseMessageContent } from "../lib/message-utils";
import type { InterviewReportData } from "../types/schemas";
import type { InterviewStage } from "./use-interview-chat";

/** 初期メッセージの型 */
export interface InitialMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  created_at: string;
}

/** パース済み初期メッセージの型 */
export interface ParsedInitialMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  created_at: string;
  report: InterviewReportData | null;
  quickReplies: string[];
  questionId: string | null;
}

/**
 * 初期メッセージをパースして、text・report・quickRepliesに分離するフック
 */
export function useParsedMessages(initialMessages: InitialMessage[]) {
  const parsedInitialMessages = useMemo(
    (): ParsedInitialMessage[] =>
      initialMessages.map((msg) => {
        if (msg.role === "assistant") {
          const { text, report, quickReplies, questionId } =
            parseMessageContent(msg.content);
          return { ...msg, content: text, report, quickReplies, questionId };
        }
        return { ...msg, report: null, quickReplies: [], questionId: null };
      }),
    [initialMessages]
  );

  const lastMessage = useMemo(() => {
    return parsedInitialMessages[parsedInitialMessages.length - 1];
  }, [parsedInitialMessages]);

  // 初期ステージを決定
  const initialStage: InterviewStage = useMemo(() => {
    if (lastMessage && "report" in lastMessage && lastMessage.report != null) {
      return "summary";
    }
    return "chat";
  }, [lastMessage]);

  return {
    parsedInitialMessages,
    lastMessage,
    initialStage,
  };
}
