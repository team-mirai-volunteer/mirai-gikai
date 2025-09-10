"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { ChatWindow } from "./chat-window";
import { Bill } from "@/features/bills/types";

interface ChatButtonProps {
  billContext: Bill;
}

export function ChatButton({ billContext }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

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

      {isOpen && (
        <ChatWindow
          billContext={billContext}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
