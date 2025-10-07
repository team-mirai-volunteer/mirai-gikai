import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@mirai-gikai/supabase";
import { DAILY_TOKEN_LIMIT } from "@/features/chat/constants/token-limits";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const admin = createAdminClient();

    // Ensure anonymous session exists
    let {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data?.user) {
        return NextResponse.json({ error: "auth_failed" }, { status: 500 });
      }
      session = { ...data.session! };
    }

    const userId = session.user.id;
    // Use JST date (UTC+9)
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Fetch today's usage; if none, create with zero usage
    const { data: usage, error } = await admin
      .from("user_token_usage")
      .select("token_used, token_limit")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    let tokenUsed = 0;
    let tokenLimit = DAILY_TOKEN_LIMIT;

    if (!usage) {
      const { error: insertError } = await admin.from("user_token_usage").insert({
        user_id: userId,
        date: today,
        token_used: 0,
        token_limit: DAILY_TOKEN_LIMIT,
      });
      if (insertError) {
        // Ignore insert race; re-read
        const { data: fallback } = await admin
          .from("user_token_usage")
          .select("token_used, token_limit")
          .eq("user_id", userId)
          .eq("date", today)
          .maybeSingle();
        if (fallback) {
          tokenUsed = fallback.token_used;
          tokenLimit = fallback.token_limit;
        }
      }
    } else if (!error) {
      tokenUsed = usage.token_used;
      tokenLimit = usage.token_limit ?? DAILY_TOKEN_LIMIT;
    }

    const remaining = Math.max(0, tokenLimit - tokenUsed);
    const canUse = remaining > 0;

    return NextResponse.json({
      userId,
      canUse,
      remaining,
      tokenUsed,
      tokenLimit,
    });
  } catch (error) {
    console.error("token-info error", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}


