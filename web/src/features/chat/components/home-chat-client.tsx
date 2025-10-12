"use client";

import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import { ChatButton } from "./chat-button";

interface HomeChatClientProps {
  currentDifficulty: DifficultyLevelEnum;
  bills: Array<{ id: string; name: string; summary?: string }>;
}

/**
 * トップページ用のチャット機能を提供するコンポーネント
 */
export function HomeChatClient({
  currentDifficulty,
  bills,
}: HomeChatClientProps) {
  return (
    <ChatButton
      difficultyLevel={currentDifficulty}
      pageContext={{
        type: "home",
        bills,
      }}
    />
  );
}
