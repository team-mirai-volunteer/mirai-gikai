"use client";

import { Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareFacebookButtonProps {
  url: string;
  className?: string;
}

export function ShareFacebookButton({
  url,
  className,
}: ShareFacebookButtonProps) {
  const handleShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className || ""}`}
    >
      <Facebook className="h-4 w-4" />
      Facebook
    </Button>
  );
}
