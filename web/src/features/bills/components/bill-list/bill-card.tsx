import Image from "next/image";
import { RubySafeLineClamp } from "@/components/ruby-safe-line-clamp";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateWithDots } from "@/lib/utils/date";
import type { BillWithContent } from "../../types";
import { BillTag } from "./bill-tag";

interface BillCardProps {
  bill: BillWithContent;
}

export function BillCard({ bill }: BillCardProps) {
  const displayTitle = bill.bill_content?.title;
  const summary = bill.bill_content?.summary;

  return (
    <Card className="hover:bg-muted/50 transition-colors relative overflow-hidden">
      <div className="flex flex-col">
        {/* 注目バッジエリア */}
        {bill.is_featured && (
          <div
            className={`${bill.thumbnail_url != null ? "absolute" : "relative"} top-3 left-3 z-1`}
          >
            <span className="inline-flex items-center justify-center px-3 py-0.5 text-xs font-medium text-[#1F2937] bg-[#F4FF5F] rounded-[20px]">
              注目🔥
            </span>
          </div>
        )}

        {/* サムネイル画像 */}
        {bill.thumbnail_url && (
          <div className="relative w-full h-65">
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
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl tracking-normal leading-tight">
                {displayTitle}
              </CardTitle>
              <RubySafeLineClamp
                text={summary}
                maxLength={132}
                lineClamp={4}
                className="text-sm mt-1 leading-relaxed"
              />
              {/* タグ表示 */}
              {bill.tags && bill.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {bill.tags.map((tag) => (
                    <BillTag key={tag.id} tag={tag} />
                  ))}
                </div>
              )}
              <p className="text-xs font-medium text-muted-foreground">
                {bill.name}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                {bill.published_at ? (
                  <time>{formatDateWithDots(bill.published_at)} 提出</time>
                ) : (
                  <span>法案提出前</span>
                )}
              </div>
            </div>
          </CardHeader>
        </div>
      </div>
    </Card>
  );
}
