import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { type BillWithContent, HOUSE_LABELS } from "../../types";
import { BillStatusBadge } from "./bill-status-badge";

interface BillCardProps {
  bill: BillWithContent;
}

export function BillCard({ bill }: BillCardProps) {
  const displayTitle = bill.bill_content?.title;
  const displaySummary = bill.bill_content?.summary;

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
          {displayTitle && (
            <p className="text-sm font-medium text-muted-foreground">
              {displayTitle}
            </p>
          )}
          {displaySummary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {displaySummary}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <BillStatusBadge
            status={bill.status}
            originatingHouse={bill.originating_house}
          />
        </div>
      </CardContent>
    </Card>
  );
}
