import type { BillWithContent } from "@/features/bills/types";
import { createShareMessage } from "@/features/bills/utils/share-message";
import { getOrigin } from "@/lib/utils/url";
import { BillShareButtonsClient } from "./bill-share-buttons-client";

interface BillShareButtonsProps {
  bill: BillWithContent;
  className?: string;
}

export async function BillShareButtons({
  bill,
  className,
}: BillShareButtonsProps) {
  const origin = await getOrigin();
  const shareUrl = `${origin}/bills/${bill.id}`;
  const shareMessage = createShareMessage(bill);

  return (
    <div className={`flex flex-col gap-3 ${className || ""}`}>
      <BillShareButtonsClient
        shareMessage={shareMessage}
        shareUrl={shareUrl}
        thumbnailUrl={bill.thumbnail_url}
      />
    </div>
  );
}
