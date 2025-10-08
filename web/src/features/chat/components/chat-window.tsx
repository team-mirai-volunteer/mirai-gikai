"use client";

import { X } from "lucide-react";
import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputError,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import type { Bill } from "@/features/bills/types";

interface ChatWindowProps {
  billContext: Bill;
  difficultyLevel: string;
  chatState: ReturnType<typeof import("@ai-sdk/react").useChat>;
  isOpen: boolean;
  onClose: () => void;
  showOverlay?: boolean;
}

export function ChatWindow({
  billContext,
  difficultyLevel,
  chatState,
  isOpen,
  onClose,
  showOverlay = true,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = chatState;

  const isResponding = status === "streaming" || status === "submitted";

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText || isResponding) {
      return;
    }

    // Send message with bill context and difficulty level in data
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
      {/* オーバーレイ */}
      {isOpen && showOverlay && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 transition-opacity cursor-default"
          onClick={onClose}
          aria-label="モーダルを閉じる"
        />
      )}

      {/* チャットウィンドウ */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 h-[80vh] bg-white shadow-xl md:bottom-4 md:right-4 md:left-auto md:h-[600px] md:w-[400px] md:rounded-lg rounded-t-lg flex flex-col border transition-transform duration-200 ${
          isOpen ? "visible translate-y-0" : "invisible translate-y-full"
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b p-4 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold">議案について質問する</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* メッセージエリア */}
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 && (
              <Message from="assistant">
                <MessageContent>
                  <div>
                    こんにちは！「{billContext.name}
                    」について、ご質問はありませんか？
                    <br />
                    <br />
                    例えば、以下のような質問にお答えできます：
                    <br />• この議案の目的は何ですか？
                    <br />• どのような影響がありますか？
                    <br />
                    <br />
                    お気軽にご質問ください。
                  </div>
                </MessageContent>
              </Message>
            )}
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, i: number) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Response
                            key={`${message.id}-${i}`}
                            className="break-words"
                          >
                            {part.text}
                          </Response>
                        );
                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            // 最後のメッセージかつ最後のパートがストリーミング中
                            isStreaming={
                              status === "streaming" &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* 入力エリア */}
        <div className="m-4">
          <PromptInput onSubmit={handleSubmit} className="flex items-end gap-1">
            <PromptInputBody className="flex-1">
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="質問を入力してください..."
                // min-w-0, wrap-anywhere が無いと長文で親幅を押し広げてしまう
                className={`min-h-8 min-w-0 wrap-anywhere`}
              />
            </PromptInputBody>
            <PromptInputSubmit
              disabled={!input && !status}
              status={status}
              className="m-2"
            />
          </PromptInput>
          <PromptInputError status={status} error={error} />
        </div>
      </div>
    </>
  );
}
