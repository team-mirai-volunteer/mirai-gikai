"use client";

import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
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
    const [isCompact, setIsCompact] = useState(false);

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

    useEffect(() => {
      let lastScrollY = window.scrollY;

      const handleScroll = () => {
        const currentScrollY = window.scrollY;

        // 下方向にスクロール
        if (currentScrollY > lastScrollY && currentScrollY > 0) {
          setIsCompact(true);
        }
        // 上方向にスクロール
        else if (currentScrollY < lastScrollY) {
          setIsCompact(false);
        }

        lastScrollY = currentScrollY;
      };

      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, []);

    return (
      <>
        <div className="fixed bottom-6 left-6 right-6 z-50 md:bottom-8 md:left-8 md:right-8 flex justify-center">
          <div
            className={`relative rounded-[50px] bg-gradient-to-tr from-[#64D8C6] to-[#BCECD3] p-[2px] transition-all duration-300 ${
              isCompact
                ? "shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] w-auto"
                : "shadow-[2px_2px_2px_0px_rgba(0,0,0,0.25)] w-full"
            }`}
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={`relative bg-white rounded-[50px] hover:opacity-90 transition-all duration-300 flex items-center gap-2.5 ${
                isCompact
                  ? "h-[35px] px-4 justify-center"
                  : "w-full justify-end py-2 pr-4 pl-6"
              }`}
              aria-label="議案について質問する"
            >
              <span
                className={`text-[#AEAEB2] text-sm font-medium leading-[1.5em] tracking-[0.01em] transition-all duration-300 ${
                  isCompact ? "text-center" : "flex-1 text-left"
                }`}
              >
                {isCompact ? "AIに質問" : "わからないことをAIに質問する"}
              </span>
              {!isCompact && (
                <div className="relative w-10 h-10 rounded-[20px] bg-mirai-gradient flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/icons/chat-button-icon.svg"
                    alt="チャット"
                    width={40}
                    height={40}
                    className="pointer-events-none"
                  />
                </div>
              )}
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
