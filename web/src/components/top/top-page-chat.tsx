"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ChatWindow } from "@/features/chat/components/chat-window";
import type { BillWithContent } from "@/features/bills/types";

export function TopPageChat({ bill }: { bill: BillWithContent }) {
  const chatState = useChat();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1280) {
      setIsOpen(true);
    }
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden md:flex xl:hidden fixed bottom-6 right-6 z-50 w-15 h-15 rounded-full bg-mirai-gradient border border-black shadow-lg hover:opacity-90 transition-opacity items-center justify-center md:bottom-8 md:right-8"
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

      <div className="hidden xl:block">
        <ChatWindow
          billContext={bill}
          difficultyLevel="normal"
          chatState={chatState}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          showOverlay={false}
        />
      </div>
    </>
  );
}

