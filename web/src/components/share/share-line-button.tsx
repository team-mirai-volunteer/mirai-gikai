"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareLineButtonProps {
  message: string;
  url: string;
  className?: string;
}

export function ShareLineButton({
  message,
  url,
  className,
}: ShareLineButtonProps) {
  const handleShare = () => {
    const text = `${message} ${url}`;
    const shareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border-green-200 ${className || ""}`}
    >
      <MessageCircle className="h-4 w-4" />
      LINE
    </Button>
  );
}
