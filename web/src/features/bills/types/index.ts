import type { Database } from "@mirai-gikai/supabase";

// Database types
export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
export type BillUpdate = Database["public"]["Tables"]["bills"]["Update"];

export type BillContent = Database["public"]["Tables"]["bill_contents"]["Row"];
export type BillContentInsert =
  Database["public"]["Tables"]["bill_contents"]["Insert"];
export type BillContentUpdate =
  Database["public"]["Tables"]["bill_contents"]["Update"];

export type MiraiStance = Database["public"]["Tables"]["mirai_stances"]["Row"];

// Enums
export type HouseEnum = Database["public"]["Enums"]["house_enum"];
export type BillStatusEnum = Database["public"]["Enums"]["bill_status_enum"];
export type StanceTypeEnum = Database["public"]["Enums"]["stance_type_enum"];

// 公開ステータス型（議案の公開/非公開を管理）
export type BillPublishStatus = "draft" | "published";

// Combined types for UI
export type BillWithStance = Bill & {
  mirai_stance?: MiraiStance;
};

export type BillWithContent = Bill & {
  bill_content?: BillContent;
  mirai_stance?: MiraiStance;
};

// House display mapping
export const HOUSE_LABELS: Record<HouseEnum, string> = {
  HR: "衆議院",
  HC: "参議院",
};

// ステータスを日本語ラベルに変換する関数
export function getBillStatusLabel(
  status: BillStatusEnum,
  originatingHouse?: HouseEnum | null
): string {
  switch (status) {
    case "introduced":
      return "提出済み";
    case "in_originating_house":
      if (originatingHouse) {
        return `${HOUSE_LABELS[originatingHouse]}審議中`;
      }
      return "審議中"; // フォールバック
    case "in_receiving_house":
      if (originatingHouse) {
        const receivingHouse = originatingHouse === "HR" ? "HC" : "HR";
        return `${HOUSE_LABELS[receivingHouse]}審議中`;
      }
      return "審議中"; // フォールバック
    case "enacted":
      return "成立";
    case "rejected":
      return "否決";
    default:
      return status; // 未知のステータスはそのまま返す
  }
}

export const STANCE_LABELS: Record<StanceTypeEnum, string> = {
  for: "賛成",
  against: "反対",
  neutral: "中立",
};
