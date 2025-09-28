"use client";

import { Button } from "@/components/ui/button";

interface ShareTwitterButtonProps {
  message: string;
  url: string;
  className?: string;
}

export function ShareTwitterButton({
  message,
  url,
  className,
}: ShareTwitterButtonProps) {
  const handleShare = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      message
    )}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className || ""}`}
    >
      X
    </Button>
  );
}
