import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateWithDots } from "@/lib/utils/date";
import { getOrigin } from "@/lib/utils/url";
import type { BillWithContent } from "../../types";
import { createShareMessage } from "../../utils/share-message";
import { BillTag } from "../bill-list/bill-tag";
import { BillDetailShareButton } from "./bill-detail-share-button";

interface BillDetailHeaderProps {
  bill: BillWithContent;
}

export async function BillDetailHeader({ bill }: BillDetailHeaderProps) {
  const displayTitle = bill.bill_content?.title;
  const displaySummary = bill.bill_content?.summary;

  const origin = await getOrigin();
  const shareUrl = `${origin}/bills/${bill.id}`;
  const shareMessage = createShareMessage(bill);

  return (
    <Card className="mb-8">
      {bill.thumbnail_url && (
        <div className="relative w-full h-70 md:h-100">
          <Image
            src={bill.thumbnail_url}
            alt={bill.name}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      )}

      <CardHeader className="pb-0">
        <div className="font-bold text-xs text-muted-foreground">
          <time dateTime={bill.published_at}>
            {formatDateWithDots(bill.published_at)}
          </time>
        </div>
        {displayTitle && (
          <h1 className="text-2xl font-bold mb-4">{displayTitle}</h1>
        )}
      </CardHeader>

      <CardContent>
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
        <BillDetailShareButton
          shareMessage={shareMessage}
          shareUrl={shareUrl}
          thumbnailUrl={bill.thumbnail_url}
        />
      </CardContent>
    </Card>
  );
}
