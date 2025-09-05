import type { BillWithStance } from "../../types";
import { BillDetailHeader } from "./bill-detail-header";
import { BillContent } from "./bill-content";
import { MiraiStanceCard } from "./mirai-stance-card";

interface BillDetailLayoutProps {
  bill: BillWithStance;
}

export function BillDetailLayout({ bill }: BillDetailLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BillDetailHeader bill={bill} />

      <BillContent bill={bill} />

      {bill.mirai_stance && (
        <div className="my-8">
          <MiraiStanceCard stance={bill.mirai_stance} />
        </div>
      )}
    </div>
  );
}
