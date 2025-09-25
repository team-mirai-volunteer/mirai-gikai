"use client";

import { useChat } from "@ai-sdk/react";
import { MessageCircle } from "lucide-react";
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
          className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-4 text-white shadow-lg hover:bg-primary/90 transition-colors md:bottom-8 md:right-8"
          aria-label="議案について質問する"
        >
          <MessageCircle className="h-6 w-6" />
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
