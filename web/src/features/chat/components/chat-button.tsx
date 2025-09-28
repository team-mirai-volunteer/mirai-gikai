"use client";

import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { forwardRef, useImperativeHandle, useState } from "react";
import type { Bill } from "@/features/bills/types";
import { ChatWindow } from "./chat-window";

interface ChatButtonProps {
  billContext: Bill;
  difficultyLevel: string;
}

export interface ChatButtonRef {
  openWithText: (selectedText: string) => void;
}

export const ChatButton = forwardRef<ChatButtonRef, ChatButtonProps>(
  ({ billContext, difficultyLevel }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    // Chat state をここで管理することで、モーダルが閉じても状態が保持される
    const chatState = useChat();

    useImperativeHandle(ref, () => ({
      openWithText: (selectedText: string) => {
        const questionText = `「${selectedText}」について教えてください。`;
        setIsOpen(true);
        chatState.sendMessage({
          text: questionText,
          metadata: { billContext, difficultyLevel },
        });
      },
    }));

    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-15 h-15 rounded-full bg-mirai-gradient border border-black shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center md:bottom-8 md:right-8"
          aria-label="議案について質問する"
        >
          <Image
            src="/icons/chat-icon.svg"
            alt="チャット"
            width={24}
            height={22}
            className="pointer-events-none"
          />
        </button>

        <ChatWindow
          billContext={billContext}
          difficultyLevel={difficultyLevel}
          chatState={chatState}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  }
);

ChatButton.displayName = "ChatButton";
