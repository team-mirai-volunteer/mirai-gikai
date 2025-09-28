"use client";

import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  message: string;
  url: string;
  className?: string;
}

export function ShareNativeButton({
  message,
  url,
  className,
}: ShareButtonProps) {
  const handleShare = async () => {
    // Web Share API が利用可能な場合
    if (navigator.share) {
      try {
        await navigator.share({
          title: "みらい議会",
          text: message,
          url: url,
        });
      } catch (error) {
        // ユーザーがキャンセルした場合は何もしない
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // フォールバック: URLをクリップボードにコピー
      try {
        await navigator.clipboard.writeText(`${message} ${url}`);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className || ""}`}
    >
      <Share className="h-4 w-4" />
      シェア
    </Button>
  );
}
