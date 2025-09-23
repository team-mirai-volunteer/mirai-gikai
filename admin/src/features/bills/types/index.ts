import type { Database } from "@mirai-gikai/supabase";

export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
export type BillUpdate = Database["public"]["Tables"]["bills"]["Update"];

export type BillStatus = Database["public"]["Enums"]["bill_status_enum"];
export type BillPublishStatus =
  Database["public"]["Enums"]["bill_publish_status"];
export type OriginatingHouse = Database["public"]["Enums"]["house_enum"];

export type BillWithContent = Bill & {
  bill_content?: Database["public"]["Tables"]["bill_contents"]["Row"];
};

// House display mapping
export const HOUSE_LABELS: Record<OriginatingHouse, string> = {
  HR: "衆議院",
  HC: "参議院",
};

// ステータスを日本語ラベルに変換する関数
export function getBillStatusLabel(
  status: BillStatus,
  originatingHouse?: OriginatingHouse | null
): string {
  switch (status) {
    case "introduced":
      return "提出済み";
    case "in_originating_house":
      if (originatingHouse) {
        return `${HOUSE_LABELS[originatingHouse]}審議中`;
      }
      return "審議中";
    case "in_receiving_house":
      if (originatingHouse) {
        const receivingHouse = originatingHouse === "HR" ? "HC" : "HR";
        return `${HOUSE_LABELS[receivingHouse]}審議中`;
      }
      return "審議中";
    case "enacted":
      return "成立";
    case "rejected":
      return "否決";
    default:
      return status;
  }
}
