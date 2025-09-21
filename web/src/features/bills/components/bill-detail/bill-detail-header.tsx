import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import type { BillWithContent } from "../../types";
import { BillStatusBadge } from "../bill-list/bill-status-badge";

interface BillDetailHeaderProps {
  bill: BillWithContent;
}

export function BillDetailHeader({ bill }: BillDetailHeaderProps) {
  const displayTitle = bill.bill_content?.title;
  const displaySummary = bill.bill_content?.summary;

  return (
    <Card className="mb-8">
      {bill.thumbnail_url && (
        <div className="relative w-full h-64 md:h-80">
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

      <CardHeader>
        {displayTitle && (
          <h1 className="text-3xl font-bold mb-4">{displayTitle}</h1>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={bill.published_at}>
            公表日: {formatDate(bill.published_at)}
          </time>
          <BillStatusBadge
            status={bill.status}
            originatingHouse={bill.originating_house}
          />
        </div>
      </CardHeader>

      <CardContent>
        {displaySummary && <div className="mb-4">{displaySummary}</div>}
        <div className="text-muted-foreground font-medium">{bill.name}</div>
      </CardContent>
    </Card>
  );
}
