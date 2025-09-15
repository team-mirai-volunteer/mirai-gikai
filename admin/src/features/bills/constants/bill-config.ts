import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";

import type { BillStatus, OriginatingHouse } from "../types";

// ステータスの表示設定（一覧画面で使用）
export const BILL_STATUS_CONFIG: Record<
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
  rejected: {
    label: "否決",
    icon: XCircle,
    color: "text-red-600 bg-red-50",
  },
};

// 提出院の設定
export const ORIGINATING_HOUSE_CONFIG: Record<OriginatingHouse, string> = {
  HR: "衆議院",
  HC: "参議院",
};
