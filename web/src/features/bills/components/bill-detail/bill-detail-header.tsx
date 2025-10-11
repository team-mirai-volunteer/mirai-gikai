import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import type { BillWithContent } from "../../types";

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

      <CardHeader className="pb-4">
        {displayTitle && (
          <h1 className="text-2xl font-bold mb-4">{displayTitle}</h1>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
          <time dateTime={bill.published_at}>
            {formatDate(bill.published_at)}
          </time>
        </div>
      </CardHeader>

      <CardContent>
        {displaySummary && (
          <p className="mb-4 leading-relaxed">{displaySummary}</p>
        )}

        {/* タグ表示 */}
        {bill.tags && bill.tags.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
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

        <p className="text-xs text-muted-foreground font-medium">{bill.name}</p>
      </CardContent>
    </Card>
  );
}
