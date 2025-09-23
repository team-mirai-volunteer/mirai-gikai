"use client";

import { ChevronDown, Eye, EyeOff, Globe, Lock } from "lucide-react";
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
  const isPublished = publishStatus === "published";

  return (
    <Popover>
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
          <h4 className="font-medium leading-none">公開ステータス</h4>
          <div>
            <form action={togglePublishStatusAction}>
              <input type="hidden" name="billId" value={billId} />
              <input type="hidden" name="currentStatus" value={publishStatus} />
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="w-full justify-start"
              >
                {isPublished ? (
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
            </form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
