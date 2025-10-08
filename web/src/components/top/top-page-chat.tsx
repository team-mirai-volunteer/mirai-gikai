"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { ChatWindow } from "@/features/chat/components/chat-window";
import type { BillWithContent } from "@/features/bills/types";

export function TopPageChat({ bill }: { bill: BillWithContent }) {
  const chatState = useChat();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div className="hidden lg:block">
      <ChatWindow
        billContext={bill}
        difficultyLevel="normal"
        chatState={chatState}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        showOverlay={false}
      />
    </div>
  );
}

