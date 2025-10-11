import type { BillWithContent } from "../types";
import { BillList } from "./bill-list/bill-list";

interface BillListSectionProps {
  bills: BillWithContent[];
}

export function BillListSection({ bills }: BillListSectionProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">議案一覧</h2>
        <p className="text-sm text-gray-600 mb-4">
          {bills.length}件の議案が公開されています
        </p>
      </div>
      <BillList bills={bills} />
    </section>
  );
}
