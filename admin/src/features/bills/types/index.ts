import type { Database } from "@mirai-gikai/supabase";

export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
export type BillUpdate = Database["public"]["Tables"]["bills"]["Update"];

export type BillStatus = Database["public"]["Enums"]["bill_status_enum"];
export type OriginatingHouse = Database["public"]["Enums"]["house_enum"];

export type BillWithContent = Bill & {
  bill_content?: Database["public"]["Tables"]["bill_contents"]["Row"];
};
