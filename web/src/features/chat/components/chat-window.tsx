"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import {
  PromptInput,
  PromptInputBody,
  PromptInputError,
  type PromptInputMessage,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import type { Bill } from "@/features/bills/types";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { SystemMessage } from "./system-message";
import { UserMessage } from "./user-message";

interface ChatWindowProps {
  billContext: Bill;
  difficultyLevel: string;
  chatState: ReturnType<typeof import("@ai-sdk/react").useChat>;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({
  billContext,
  difficultyLevel,
  chatState,
  isOpen,
  onClose,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = chatState;
  const isDesktop = useIsDesktop();

  const isResponding = status === "streaming" || status === "submitted";

  // Auto-resize textarea based on content
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText || isResponding) {
      return;
    }

    // Send message with bill context and difficulty level in metadata
    // By default, this sends a HTTP POST request to the /api/chat endpoint.
    sendMessage({
      text: message.text ?? "",
      metadata: { billContext, difficultyLevel },
    });

    // Reset form
    setInput("");
  };

  return (
    <>
      {/* オーバーレイ（1400px未満でのみ表示） */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 transition-opacity cursor-default pc:hidden"
          onClick={onClose}
          aria-label="モーダルを閉じる"
        />
      )}

      {/* チャットウィンドウ */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 h-[80vh] bg-white shadow-xl md:bottom-4 md:right-4 md:left-auto md:h-[600px] md:w-[450px] md:rounded-lg rounded-t-2xl flex flex-col
					pc:visible pc:opacity-100
					${isOpen ? "visible opacity-100" : "invisible opacity-0 pc:visible pc:opacity-100"}
				`}
      >
        {/* ヘッダー - ハンドル */}
        <div className="flex items-center justify-center pt-1 px-6">
          <div className="w-[135px] h-2 bg-[#D9D9D9] rounded-full" />
        </div>

        {/* メッセージエリア（スクロール可能） */}
        <Conversation className="flex-1 min-h-0 px-6">
          <ConversationContent className="p-0 flex flex-col gap-3 pt-6">
            <div className="flex flex-col gap-4">
              {/* 初期メッセージ */}
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold leading-[1.8] text-[#1F2937]">
                  なんでも質問してください。
                </p>
                <p className="text-sm font-bold leading-[1.8] text-[#1F2937]">
                  本文中のテキストを選択すると簡単にAIに質問できます
                </p>
              </div>

              {/* サンプル質問チップ */}
              <ul className="flex flex-wrap gap-3">
                {["みらい議会って何？", "国会って何をするところ？"].map(
                  (question) => (
                    <li key={question}>
                      <button
                        type="button"
                        className="px-3 py-1 text-xs leading-[2] text-[#0F8472] border border-[#2AA693] rounded-2xl hover:bg-gray-50"
                      >
                        {question}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
            {messages.map((message) => {
              const isStreaming =
                status === "streaming" && message.id === messages.at(-1)?.id;

              return message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <SystemMessage
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming}
                />
              );
            })}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* 入力エリア（固定下部） */}
        <div className="px-6 pb-2 pt-2 bg-white">
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
                onChange={handleInputChange}
                value={input}
                placeholder="わからないことをAIに質問する"
                rows={1}
                submitOnEnter={isDesktop}
                // min-w-0, wrap-anywhere が無いと長文で親幅を押し広げてしまう
                className={`!min-h-0 min-w-0 wrap-anywhere text-sm font-medium leading-[1.5em] tracking-[0.01em] placeholder:text-[#AEAEB2] placeholder:font-medium placeholder:leading-[1.5em] placeholder:tracking-[0.01em] placeholder:no-underline border-none focus:ring-0 bg-transparent shadow-none !py-2 !px-0`}
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
        </div>
      </div>
    </>
  );
}
