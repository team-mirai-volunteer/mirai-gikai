"use client";

import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { Bill } from "@/features/bills/types";
import { ChatWindow } from "./chat-window";

// アニメーション定数
const ANIMATION_DURATION = {
  SIZE_TRANSITION: 50, // ボタンサイズ変更のアニメーション時間（ms）
  OPACITY_TRANSITION: 300, // テキストopacityのトランジション時間（ms）
  TEXT_CHANGE_DELAY: 300, // テキスト内容変更までの待機時間（opacity完全に0になるまで）
  TEXT_FADE_IN: 50, // テキストフェードイン待機時間（ms）
} as const;

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
    const [showText, setShowText] = useState(true);

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
          if (!isCompact) {
            setShowText(false);
            setTimeout(() => {
              setIsCompact(true);
              setTimeout(() => setShowText(true), ANIMATION_DURATION.TEXT_FADE_IN);
            }, ANIMATION_DURATION.TEXT_CHANGE_DELAY);
          }
        }
        // 上方向にスクロール
        else if (currentScrollY < lastScrollY) {
          if (isCompact) {
            setShowText(false);
            setTimeout(() => {
              setIsCompact(false);
              setTimeout(() => setShowText(true), ANIMATION_DURATION.TEXT_FADE_IN);
            }, ANIMATION_DURATION.TEXT_CHANGE_DELAY);
          }
        }

        lastScrollY = currentScrollY;
      };

      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, [isCompact]);

    return (
      <>
        <div className="fixed bottom-2 left-6 right-6 z-50 md:bottom-8 md:left-8 md:right-8 flex justify-center">
          <div
            className={`relative rounded-[50px] bg-gradient-to-tr from-[#64D8C6] to-[#BCECD3] p-[2px] shadow-[2px_2px_2px_0px_rgba(0,0,0,0.25)] origin-center flex`}
            style={{
              flexBasis: isCompact ? "120px" : "340px",
              transition: `flex-basis ${ANIMATION_DURATION.SIZE_TRANSITION}ms ease-in-out, box-shadow ${ANIMATION_DURATION.SIZE_TRANSITION}ms ease-in-out`,
            }}
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={`relative bg-white rounded-[50px] hover:opacity-90 flex items-center w-full ${
                isCompact
                  ? "px-4 justify-center gap-2.5"
                  : "justify-end pr-4 pl-6 gap-2.5"
              }`}
              style={{
                height: isCompact ? "35px" : "56px",
                paddingTop: isCompact ? "8px" : "8px",
                paddingBottom: isCompact ? "8px" : "8px",
                transition: `all ${ANIMATION_DURATION.SIZE_TRANSITION}ms ease-in-out`,
              }}
              aria-label="議案について質問する"
            >
              <span
                className={`text-[#AEAEB2] text-sm font-medium leading-[1.5em] tracking-[0.01em] ${
                  isCompact ? "text-center" : "flex-1 text-left"
                } ${showText ? "opacity-100" : "opacity-0"}`}
                style={{
                  transition: `opacity ${ANIMATION_DURATION.OPACITY_TRANSITION}ms ease-in-out`,
                }}
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
