"use client";

import { MessageCircleQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface TextSelectionTooltipProps {
  isVisible: boolean;
  selectedText: string;
  rect: DOMRect | null;
  onAskQuestion: (text: string) => void;
}

export function TextSelectionTooltip({
  isVisible,
  selectedText,
  rect,
  onAskQuestion,
}: TextSelectionTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!rect || !isVisible) return;

    const tooltipHeight = 40;
    const tooltipWidth = 104;
    const margin = 4;

    // viewport座標をそのまま使用（fixed positionで）
    const top = rect.top - tooltipHeight - margin;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    // 画面左右からはみ出さないよう調整
    const maxLeft = window.innerWidth - tooltipWidth - margin;
    left = Math.max(margin, Math.min(left, maxLeft));

    setPosition({ top, left });
  }, [rect, isVisible]);

  if (!isVisible || !rect) {
    return null;
  }

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAskQuestion(selectedText)}
          className="text-xs h-7 px-2"
        >
          <MessageCircleQuestion className="h-3 w-3 mr-1" />
          AIに質問
        </Button>
      </div>
    </div>
  );
}
