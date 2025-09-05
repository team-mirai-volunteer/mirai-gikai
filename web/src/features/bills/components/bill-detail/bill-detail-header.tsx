import { formatDate } from "@/lib/utils/date";
import { BillStatusBadge } from "../bill-list/bill-status-badge";
import type { Bill } from "../../types";

interface BillDetailHeaderProps {
  bill: Bill;
}

export function BillDetailHeader({ bill }: BillDetailHeaderProps) {
  return (
    <header className="mb-8">
      {bill.headline && (
        <div className="text-lg text-muted-foreground mb-4 font-medium">
          {bill.headline}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">{bill.name}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <time dateTime={bill.published_at}>
          公表日: {formatDate(bill.published_at)}
        </time>
        <BillStatusBadge status={bill.status} />
      </div>

      {bill.description && (
        <div className="mt-4 text-muted-foreground">{bill.description}</div>
      )}
    </header>
  );
}
