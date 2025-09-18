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
