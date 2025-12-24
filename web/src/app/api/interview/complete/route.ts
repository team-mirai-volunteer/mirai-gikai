import { NextResponse } from "next/server";
import { getChatSupabaseUser } from "@/features/chat/lib/supabase-server";
import { completeInterviewSession } from "@/features/interview-session/services/complete-interview-session";

export async function POST(req: Request) {
  const { sessionId, interviewConfigId, billId } = await req.json();

  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    return NextResponse.json(
      { error: "Anonymous session required" },
      { status: 401 }
    );
  }

  if (!sessionId || !interviewConfigId || !billId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const report = await completeInterviewSession({
      sessionId,
      interviewConfigId,
      billId,
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Complete interview error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to complete interview",
      },
      { status: 500 }
    );
  }
}
