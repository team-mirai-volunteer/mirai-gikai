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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // モバイル判定（768px以下をモバイルとする）
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (!rect || !isVisible) return;

    const tooltipHeight = 40;
    const tooltipWidth = 104;
    const margin = 4;

    if (isMobile) {
      // モバイルの場合は画面下部に固定
      const mobileTooltipHeight = 40; // モバイル用の高さ
      const mobileTooltipWidth = 180; // モバイル用の幅
      const bottomMargin = 32; // 下部からの余白（親指が届きやすい位置）
      const top = window.innerHeight - mobileTooltipHeight - bottomMargin;
      const left = (window.innerWidth - mobileTooltipWidth) / 2;
      setPosition({ top, left });
    } else {
      // デスクトップの場合は従来の位置（選択範囲の上）
      const top = rect.top - tooltipHeight - margin;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      // 画面左右からはみ出さないよう調整
      const maxLeft = window.innerWidth - tooltipWidth - margin;
      left = Math.max(margin, Math.min(left, maxLeft));

      setPosition({ top, left });
    }
  }, [rect, isVisible, isMobile]);

  if (!isVisible || !rect) {
    return null;
  }

  return (
    <div
      className={`fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 ${
        isMobile ? "animate-shake" : ""
      }`}
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
          className={`${isMobile ? "text-sm h-8 px-3" : "text-xs h-7 px-2"}`}
        >
          <MessageCircleQuestion
            className={`mr-1 ${isMobile ? "h-4 w-4" : "h-3 w-3"}`}
          />
          {isMobile && "選択部分を"}AIに質問
        </Button>
      </div>
    </div>
  );
}
