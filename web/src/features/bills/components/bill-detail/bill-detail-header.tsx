import Image from "next/image";
import { formatDateWithDots } from "@/lib/utils/date";
import type { BillWithContent } from "../../types";
import { getBillShareData } from "../../utils/share";
import { BillTag } from "../bill-list/bill-tag";
import { BillDetailShareButton } from "./bill-detail-share-button";

interface BillDetailHeaderProps {
  bill: BillWithContent;
}

export async function BillDetailHeader({ bill }: BillDetailHeaderProps) {
  const displayTitle = bill.bill_content?.title;
  const displaySummary = bill.bill_content?.summary;

  const { shareUrl, shareMessage, thumbnailUrl } = await getBillShareData(bill);

  return (
    <div className="mb-8 bg-white rounded-b-4xl">
      {bill.thumbnail_url ? (
        <div className="relative w-full h-72 md:h-80">
          <Image
            src={bill.thumbnail_url}
            alt={bill.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      ) : (
        <div className="w-full h-20 bg-white-100" />
      )}

      <div className="px-4 pt-8">
        {displayTitle && (
          <h1 className="text-2xl font-bold mb-4">{displayTitle}</h1>
        )}
      </div>

      <div className="px-4 pb-8">
        {displaySummary && (
          <p className="mb-4 leading-relaxed">{displaySummary}</p>
        )}

        {/* タグ表示 */}
        {bill.tags && bill.tags.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {bill.tags.map((tag) => (
              <BillTag key={tag.id} tag={tag} />
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground font-medium mb-4">
          {bill.name}
        </p>
        <div className="font-bold text-xs text-muted-foreground mb-4">
          {bill.published_at ? (
            <time dateTime={bill.published_at}>
              {formatDateWithDots(bill.published_at)} 提出
            </time>
          ) : (
            <span>法案提出前</span>
          )}
        </div>
        <BillDetailShareButton
          shareMessage={shareMessage}
          shareUrl={shareUrl}
          thumbnailUrl={thumbnailUrl}
        />
      </div>
    </div>
  );
}
