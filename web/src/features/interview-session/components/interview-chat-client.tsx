"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputError,
  PromptInputHint,
  type PromptInputMessage,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { useAnonymousSupabaseUser } from "@/features/chat/hooks/use-anonymous-supabase-user";
import type { InterviewChatMetadata } from "@/features/interview-session/types";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { InterviewMessage } from "./interview-message";

interface InterviewChatClientProps {
  billId: string;
  interviewConfigId: string;
  sessionId: string;
  initialMessages: Array<{
    role: "assistant" | "user";
    content: string;
    created_at: string;
  }>;
}

export function InterviewChatClient({
  billId,
  interviewConfigId,
  sessionId,
  initialMessages,
}: InterviewChatClientProps) {
  // 匿名ユーザー認証
  useAnonymousSupabaseUser();

  // 初期メッセージをUIMessage形式に変換
  const convertedInitialMessages = useMemo(() => {
    return initialMessages.map((msg) => ({
      id: `msg-${msg.created_at}`,
      role: msg.role,
      content: msg.content,
      parts: [{ type: "text" as const, text: msg.content }],
      metadata: {
        interviewSessionId: sessionId,
        interviewConfigId,
        billId,
      } as InterviewChatMetadata,
    }));
  }, [initialMessages, sessionId, interviewConfigId, billId]);

  // useChatフックを使用
  const chatState = useChat({
    transport: new DefaultChatTransport({
      api: "/api/interview/chat",
      body: {
        billId,
      },
    }),
    messages: convertedInitialMessages,
  });

  const { messages, sendMessage, status, error } = chatState;
  const isResponding = status === "streaming" || status === "submitted";
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDesktop = useIsDesktop();

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText || isResponding) {
      return;
    }

    sendMessage({
      text: message.text ?? "",
      metadata: {
        interviewSessionId: sessionId,
        interviewConfigId,
        billId,
      },
    });

    // Reset form
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="flex flex-col h-screen py-12 pt-24 md:pt-12">
      <Conversation className="flex-1 overflow-y-auto">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-bold leading-[1.8] text-[#1F2937]">
                法案についてのAIインタビューを開始します。
              </p>
              <p className="text-sm text-gray-600">
                あなたの意見や経験をお聞かせください。
              </p>
            </div>
          )}
          {messages.map((message) => {
            const isStreaming =
              status === "streaming" && message.id === messages.at(-1)?.id;

            return (
              <InterviewMessage
                key={message.id}
                message={message}
                isStreaming={isStreaming}
              />
            );
          })}
          {status === "submitted" && (
            <span className="text-sm text-gray-500">考え中...</span>
          )}
          {error && (
            <div className="text-sm text-red-500">
              エラーが発生しました: {error.message}
            </div>
          )}
        </ConversationContent>
      </Conversation>

      <div className="px-6 pb-4 pt-2">
        <PromptInput
          onSubmit={handleSubmit}
          className="flex items-end gap-2.5 py-2 pl-6 pr-4 bg-white rounded-[50px] border-2 border-transparent bg-clip-padding divide-y-0"
          style={{
            backgroundImage:
              "linear-gradient(white, white), linear-gradient(-45deg, rgba(188, 236, 211, 1) 0%, rgba(100, 216, 198, 1) 100%)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <PromptInputBody className="flex-1">
            <PromptInputTextarea
              ref={textareaRef}
              onChange={handleInputChange}
              value={input}
              placeholder="AIに質問に回答する"
              rows={1}
              submitOnEnter={isDesktop}
              className="!min-h-0 min-w-0 wrap-anywhere text-sm font-medium leading-[1.5em] tracking-[0.01em] placeholder:text-[#AEAEB2] placeholder:font-medium placeholder:leading-[1.5em] placeholder:tracking-[0.01em] placeholder:no-underline border-none focus:ring-0 bg-transparent shadow-none !py-2 !px-0"
            />
          </PromptInputBody>
          <button
            type="submit"
            disabled={!input || isResponding}
            className="flex-shrink-0 w-10 h-10 disabled:opacity-50"
          >
            <Image
              src="/icons/send-button-icon.svg"
              alt="送信"
              width={40}
              height={40}
              className="w-full h-full"
            />
          </button>
        </PromptInput>
        <PromptInputError status={status} error={error} />
        {messages.length > 0 && <PromptInputHint />}
      </div>
    </div>
  );
}
