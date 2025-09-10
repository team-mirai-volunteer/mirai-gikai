"use client";

import { useChat } from "@ai-sdk/react";
import { X } from "lucide-react";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  PromptInput,
  PromptInputBody,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { useState } from "react";
import { Bill } from "@/features/bills/types";

interface ChatWindowProps {
  billContext: Bill;
  onClose: () => void;
}

export function ChatWindow({ billContext, onClose }: ChatWindowProps) {
  const [input, setInput] = useState("");
  // By default, the useChat hook sends a HTTP POST request to the /api/chat endpoint.
  const { messages, sendMessage, status } = useChat();

  const isResponding = status === "streaming" || status === "submitted";

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText || isResponding) {
      return;
    }

    // Send message with bill context in data
    sendMessage({
      text: message.text ?? "",
      metadata: { billContext },
    });

    // Reset form
    setInput("");
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 h-[70vh] bg-white shadow-xl md:bottom-4 md:right-4 md:left-auto md:h-[600px] md:w-[400px] md:rounded-lg flex flex-col border">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b p-4 bg-gray-50 md:rounded-t-lg">
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
                  <br />• みらいはなぜこのスタンスを取っているのですか？
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
                {message.parts.map((part, index) => {
                  if (part.type === "text") {
                    return (
                      <Response
                        key={`${message.id}-${index}`}
                        className="break-words"
                      >
                        {part.text}
                      </Response>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Loader />}
        </ConversationContent>
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
      </div>
    </div>
  );
}
