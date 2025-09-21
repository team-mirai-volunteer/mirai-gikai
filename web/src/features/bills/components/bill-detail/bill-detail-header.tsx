import Image from "next/image";
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
    <header className="mb-8">
      {bill.thumbnail_url && (
        <div className="relative mb-6 w-full h-80">
          <Image
            src={bill.thumbnail_url}
            alt={bill.name}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      )}

      {displayTitle && (
        <div className="text-lg text-muted-foreground mb-4 font-medium">
          {displayTitle}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">{bill.name}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <time dateTime={bill.published_at}>
          公表日: {formatDate(bill.published_at)}
        </time>
        <BillStatusBadge
          status={bill.status}
          originatingHouse={bill.originating_house}
        />
      </div>

      {displaySummary && (
        <div className="mt-4 text-muted-foreground">{displaySummary}</div>
      )}
    </header>
  );
}
