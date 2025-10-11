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
        <div className="fixed bottom-6 left-6 right-6 z-50 md:bottom-8 md:left-8 md:right-8">
          <div className="relative rounded-[50px] bg-gradient-to-tr from-[#64D8C6] to-[#BCECD3] p-[2px] shadow-[2px_2px_2px_0px_rgba(0,0,0,0.25)]">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative w-full bg-white rounded-[50px] hover:opacity-90 transition-opacity flex items-center justify-end gap-2.5 py-2 pr-4 pl-6"
              aria-label="議案について質問する"
            >
              <span className="flex-1 text-[#AEAEB2] text-sm font-medium leading-[1.5em] tracking-[0.01em] text-left">
                わからないことをAIに質問する
              </span>
              <div className="relative w-10 h-10 rounded-[20px] bg-mirai-gradient flex items-center justify-center flex-shrink-0">
                <Image
                  src="/icons/chat-button-icon.svg"
                  alt="チャット"
                  width={40}
                  height={40}
                  className="pointer-events-none"
                />
              </div>
            </button>
          </div>
        </div>

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
