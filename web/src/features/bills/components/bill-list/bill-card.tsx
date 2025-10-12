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
      <div className="flex flex-col">
        {/* 注目バッジエリア */}
        {bill.is_featured && (
          <div className="relative px-3 py-2 bg-white rounded-t-lg">
            <span className="inline-flex items-center justify-center px-3 py-0.5 text-xs font-medium text-[#1F2937] bg-[#F4FF5F] rounded-[20px]">
              注目🔥
            </span>
          </div>
        )}

        {/* サムネイル画像 */}
        {bill.thumbnail_url && (
          <div className="relative w-full h-48">
            <Image
              src={bill.thumbnail_url}
              alt={bill.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        {/* コンテンツエリア */}
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
