import type { BillWithContent } from "@/features/bills/types";
import { getBillShareData } from "@/features/bills/utils/share";
import { BillShareButtonsClient } from "./bill-share-buttons-client";

interface BillShareButtonsProps {
  bill: BillWithContent;
  className?: string;
}

export async function BillShareButtons({
  bill,
  className,
}: BillShareButtonsProps) {
  const { shareUrl, shareMessage, thumbnailUrl } = await getBillShareData(bill);

  return (
    <div className={`flex flex-col gap-3 ${className || ""}`}>
      <BillShareButtonsClient
        shareMessage={shareMessage}
        shareUrl={shareUrl}
        thumbnailUrl={thumbnailUrl}
      />
    </div>
  );
}
