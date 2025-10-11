import { ShareFacebookButton } from "@/components/share/share-facebook-button";
import { ShareLineButton } from "@/components/share/share-line-button";
import { ShareNativeButton } from "@/components/share/share-native-button";
import { ShareTwitterButton } from "@/components/share/share-twitter-button";
import { ShareUrlButton } from "@/components/share/share-url-button";
import type { BillWithContent } from "@/features/bills/types";
import { getOrigin } from "@/lib/utils/url";
import { BillShareActionButtons } from "./bill-share-action-buttons";

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

  const shareMessage = `「${bill.name}」についてチェック！ #みらい議会`;

  return (
    <div className={`flex flex-col gap-3 ${className || ""}`}>
      {/* アクションボタン */}
      <BillShareActionButtons
        shareMessage={shareMessage}
        shareUrl={shareUrl}
      />

      {/* SNS共有ボタン */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ShareTwitterButton message={shareMessage} url={shareUrl} />
        <ShareFacebookButton url={shareUrl} />
        <ShareLineButton
          message={shareMessage}
          url={shareUrl}
          className="md:hidden"
        />
        <ShareNativeButton
          message={shareMessage}
          url={shareUrl}
          className="md:hidden"
        />
        <ShareUrlButton url={shareUrl} />
      </div>
    </div>
  );
}
