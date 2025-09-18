import { Calendar, Edit, FileText, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBills } from "../../api/get-bills";
import { BILL_STATUS_CONFIG } from "../../constants/bill-config";
import type { Bill, BillStatus } from "../../types";
import { getBillStatusLabel, HOUSE_LABELS } from "../../types";

function StatusBadge({ status, originatingHouse }: { status: BillStatus; originatingHouse: Bill["originating_house"] }) {
  const config = BILL_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
    >
      <Icon className="h-4 w-4" />
      <span>{getBillStatusLabel(status, originatingHouse)}</span>
    </div>
  );
}

function BillCard({ bill }: { bill: Bill }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-gray-900 leading-6">
            {bill.name}
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <StatusBadge status={bill.status} originatingHouse={bill.originating_house} />
            <div className="flex items-center gap-2">
              <Link href={`/bills/${bill.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  編集
                </Button>
              </Link>
              <Link href={`/bills/${bill.id}/contents/edit`}>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  コンテンツ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
          <div>
            <span className="text-gray-500">提出院:</span>
            <div className="font-medium text-gray-900">
              {HOUSE_LABELS[bill.originating_house]}
            </div>
          </div>
          <div>
            <span className="text-gray-500">状況:</span>
            <div className="font-medium text-gray-900">
              {bill.status_note || "-"}
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-gray-500 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              公開日:
            </span>
            <div className="font-medium text-gray-900">
              {new Date(bill.published_at).toLocaleDateString("ja-JP")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export async function BillList() {
  const bills = await getBills();

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-gray-600">{bills.length}件の議案</div>
        <Link href="/bills/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            新規作成
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {bills.map((bill) => (
          <BillCard key={bill.id} bill={bill} />
        ))}
      </div>
    </div>
  );
}
