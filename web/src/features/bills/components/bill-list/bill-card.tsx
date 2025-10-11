import Image from "next/image";
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
      <div className="flex flex-col md:flex-row">
        {bill.thumbnail_url && (
          <div className="relative w-full h-48 md:w-64 md:h-auto md:self-stretch flex-shrink-0">
            <Image
              src={bill.thumbnail_url}
              alt={bill.name}
              fill
              className="object-cover rounded-t-lg md:rounded-t-none md:rounded-l-lg"
              sizes="(max-width: 768px) 100vw, 256px"
            />
          </div>
        )}
        <div className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{HOUSE_LABELS[bill.originating_house]}</span>
                <span>•</span>
                <time>{formatDate(bill.published_at)}</time>
              </div>
              <CardTitle className="text-lg leading-tight">
                {displayTitle}
              </CardTitle>
              {displaySummary && (
                <p className="text-sm line-clamp-2 mt-1">{displaySummary}</p>
              )}
              {/* タグ表示 */}
              {bill.tags && bill.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {bill.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-black bg-[#E8E8E8] rounded-full"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm font-medium text-muted-foreground">
                {bill.name}
              </p>
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
        </div>
      </div>
    </Card>
  );
}
