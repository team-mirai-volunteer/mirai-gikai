import {
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBills } from "../../api/get-bills";
import type { Bill, BillStatus, OriginatingHouse } from "../../types";

const statusConfig: Record<
  BillStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  introduced: {
    label: "提出済み",
    icon: FileText,
    color: "text-blue-600 bg-blue-50",
  },
  in_originating_house: {
    label: "提出院審議中",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
  },
  in_receiving_house: {
    label: "送付院審議中",
    icon: AlertCircle,
    color: "text-orange-600 bg-orange-50",
  },
  enacted: {
    label: "成立",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
  },
  rejected: { label: "否決", icon: XCircle, color: "text-red-600 bg-red-50" },
};

const originatingHouseConfig: Record<OriginatingHouse, string> = {
  HR: "衆議院",
  HC: "参議院",
};

function StatusBadge({ status }: { status: BillStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
    >
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}

function BillCard({ bill }: { bill: Bill }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 leading-6">
            {bill.name}
          </CardTitle>
          <StatusBadge status={bill.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">提出院:</span>
            <div className="font-medium text-gray-900">
              {originatingHouseConfig[bill.originating_house]}
            </div>
          </div>
          <div>
            <span className="text-gray-500">状況:</span>
            <div className="font-medium text-gray-900">
              {bill.status_note || "-"}
            </div>
          </div>
          <div>
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
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">{bills.length}件の議案</div>
      </div>

      <div className="space-y-4">
        {bills.map((bill) => (
          <BillCard key={bill.id} bill={bill} />
        ))}
      </div>
    </div>
  );
}
