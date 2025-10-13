import type { BillWithContent } from "@/features/bills/types";
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

  const shareMessage = `${bill.bill_content?.title ?? bill.name} #みらい議会`;

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
