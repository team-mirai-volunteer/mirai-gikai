"use client";

import { ChevronDown, Eye, EyeOff, Globe, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { togglePublishStatusAction } from "../../actions/update-publish-status";
import type { BillPublishStatus } from "../../types";

interface PublishStatusBadgeProps {
  billId: string;
  publishStatus: BillPublishStatus;
}

export function PublishStatusBadge({
  billId,
  publishStatus,
}: PublishStatusBadgeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(true);
  const isPublished = publishStatus === "published";

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("billId", billId);
      formData.append("currentStatus", publishStatus);
      await togglePublishStatusAction(formData);
      setOpen(false); // Popoverを閉じる
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border-2 hover:opacity-80 ${
            isPublished
              ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
              : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
          }`}
        >
          {isPublished ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          <span>{isPublished ? "公開中" : "下書き"}</span>
          <ChevronDown className="h-3 w-3 ml-0.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-2">
          <h4 className="text-xs leading-none">公開ステータス</h4>
          <div>
            <Button
              onClick={handleSubmit}
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="w-full justify-start"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  処理中...
                </>
              ) : isPublished ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  下書きに戻す
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  公開する
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
