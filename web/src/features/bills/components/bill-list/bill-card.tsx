import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import type { Bill } from "../../types";
import { BillStatusBadge } from "./bill-status-badge";
import { HOUSE_LABELS } from "../../types";

interface BillCardProps {
  bill: Bill;
}

export function BillCard({ bill }: BillCardProps) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{HOUSE_LABELS[bill.originating_house]}</span>
            <span>•</span>
            <time>{formatDate(bill.published_at)}</time>
          </div>
          <CardTitle className="text-lg leading-tight">{bill.name}</CardTitle>
          {bill.headline && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {bill.headline}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <BillStatusBadge status={bill.status} />
        </div>
      </CardContent>
    </Card>
  );
}
