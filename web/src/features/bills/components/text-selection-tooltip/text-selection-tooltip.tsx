"use client";

import { MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTooltipPosition } from "./use-tooltip-position";

interface TextSelectionTooltipProps {
  isVisible: boolean;
  selectedText: string;
  rect: DOMRect | null;
  onAskQuestion: (text: string) => void;
}

const MOBILE_BREAKPOINT = 768;

export function TextSelectionTooltip({
  isVisible,
  selectedText,
  rect,
  onAskQuestion,
}: TextSelectionTooltipProps) {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const position = useTooltipPosition({ rect, isVisible, isMobile });

  if (!isVisible || !rect) {
    return null;
  }

  const buttonSize = isMobile ? "text-sm h-8 px-3" : "text-xs h-7 px-2";
  const iconSize = isMobile ? "h-4 w-4" : "h-3 w-3";
  const shouldShake = isMobile;

  return (
    <div
      className={`fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 ${
        shouldShake ? "animate-shake" : ""
      }`}
      style={position}
    >
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAskQuestion(selectedText)}
          className={buttonSize}
        >
          <MessageCircleQuestion className={`mr-1 ${iconSize}`} />
          {isMobile && "選択部分を"}AIに質問
        </Button>
      </div>
    </div>
  );
}
