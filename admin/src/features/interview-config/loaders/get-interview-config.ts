import { createAdminClient } from "@mirai-gikai/supabase";
import type { InterviewConfig } from "../types";

export async function getInterviewConfig(
  billId: string
): Promise<InterviewConfig | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("interview_configs")
    .select("*")
    .eq("bill_id", billId)
    .single();

  if (error) {
    // レコードが存在しない場合はnullを返す（エラーではない）
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Failed to fetch interview config:", error);
    return null;
  }

  return data;
}
