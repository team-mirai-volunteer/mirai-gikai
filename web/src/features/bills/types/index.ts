import type { Database } from "@mirai-gikai/supabase";

// Database types
export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
export type BillUpdate = Database["public"]["Tables"]["bills"]["Update"];

export type MiraiStance = Database["public"]["Tables"]["mirai_stances"]["Row"];

// Enums
export type HouseEnum = Database["public"]["Enums"]["house_enum"];
export type BillStatusEnum = Database["public"]["Enums"]["bill_status_enum"];
export type StanceTypeEnum = Database["public"]["Enums"]["stance_type_enum"];

// Combined types for UI
export type BillWithStance = Bill & {
  mirai_stance?: MiraiStance;
};

// Status display mapping
export const BILL_STATUS_LABELS: Record<BillStatusEnum, string> = {
  introduced: "提出済み",
  in_originating_house: "発議院審議中",
  in_receiving_house: "受議院審議中",
  enacted: "成立",
  rejected: "否決",
};

export const HOUSE_LABELS: Record<HouseEnum, string> = {
  HR: "衆議院",
  HC: "参議院",
};

export const STANCE_LABELS: Record<StanceTypeEnum, string> = {
  for: "賛成",
  against: "反対",
  neutral: "中立",
};
