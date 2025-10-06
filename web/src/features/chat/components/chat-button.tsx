"use client";

import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { Bill } from "@/features/bills/types";
import { useAnonymousAuth } from "../hooks/use-anonymous-auth";
import { checkTokenLimit } from "../actions/check-token-limit";
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
    const { userId, isLoading } = useAnonymousAuth();
    const [canUseChat, setCanUseChat] = useState(true);
    const [tokenInfo, setTokenInfo] = useState<{
      remaining: number;
      tokenUsed: number;
      tokenLimit: number;
    } | null>(null);

    // Chat state をここで管理することで、モーダルが閉じても状態が保持される
    const chatState = useChat();

    useEffect(() => {
      async function checkLimit() {
        if (!userId) return;

        const { canUse, remaining, tokenUsed, tokenLimit } =
          await checkTokenLimit(userId);
        setCanUseChat(canUse);
        setTokenInfo({ remaining, tokenUsed, tokenLimit });
      }

      checkLimit();
    }, [userId]);

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

    // 読み込み中またはトークン制限到達時は非表示
    if (isLoading || !canUseChat) {
      return null;
    }

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
          tokenInfo={tokenInfo}
        />
      </>
    );
  }
);

ChatButton.displayName = "ChatButton";
