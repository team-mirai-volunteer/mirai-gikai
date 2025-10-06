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

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={bill.published_at}>
            {formatDate(bill.published_at)}
          </time>
        </div>
      </CardHeader>

      <CardContent>
        {displaySummary && (
          <p className="mb-4 leading-relaxed">{displaySummary}</p>
        )}
        <p className="text-xs text-muted-foreground font-medium">{bill.name}</p>
      </CardContent>
    </Card>
  );
}
