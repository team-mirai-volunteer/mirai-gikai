"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { ChatWindow } from "@/features/chat/components/chat-window";
import type { BillWithContent } from "@/features/bills/types";

const DEFAULT_CONTEXT: BillWithContent | null = null;

export function TopPageChat({ bill }: { bill: BillWithContent | null }) {
  const chatState = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const isAboveThresholdRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAboveThreshold = () => window.innerWidth >= 1536;

    const initialAbove = isAboveThreshold();
    isAboveThresholdRef.current = initialAbove;
    setIsOpen(initialAbove);

    const handleResize = () => {
      const above = isAboveThreshold();
      if (above !== isAboveThresholdRef.current) {
        isAboveThresholdRef.current = above;
        setIsOpen(above);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!bill) {
    return null;
  }

  return (
    <>
      <div className="hidden 2xl:block">
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

