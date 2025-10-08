"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { ChatWindow } from "@/features/chat/components/chat-window";
import type { BillWithContent } from "@/features/bills/types";

const DEFAULT_CONTEXT: BillWithContent = {
  id: 0,
  created_at: null,
  updated_at: null,
  name: "審議中の法案",
  status: "published",
  summary: null,
  uri: null,
  originating_house: null,
  receiving_house: null,
  published_at: null,
  publish_status: "published",
  bill_content: {
    id: 0,
    bill_id: 0,
    title: "法案について何でも質問してください",
    summary:
      "国会で審議されている法案について、どなたでも自由に質問できます。疑問点や気になる点があればお気軽にどうぞ。",
    content: null,
    created_at: null,
    updated_at: null,
    difficulty_level: "normal",
  },
};

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

  const context = bill ?? DEFAULT_CONTEXT;

  return (
    <>
      <div className="hidden 2xl:block">
        <ChatWindow
          billContext={context}
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

