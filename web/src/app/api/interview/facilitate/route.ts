/**
 * @deprecated このAPIは非推奨です。
 * ファシリテーション判定は /api/interview/chat のバックエンドで統合されました。
 * レスポンスの next_stage フィールドを使用してステージ遷移を判定してください。
 * このエンドポイントは後方互換性のために残されていますが、将来のバージョンで削除される予定です。
 */
import { getChatSupabaseUser } from "@/features/chat/server/utils/supabase-server";
import { facilitateInterview } from "@/features/interview-session/server/services/facilitate-interview";
import type { SimpleMessage } from "@/features/interview-session/shared/types";

/** @deprecated このエンドポイントは非推奨です。/api/interview/chat を使用してください。 */
export async function POST(req: Request) {
  const {
    messages,
    billId,
    currentStage,
  }: {
    messages: SimpleMessage[];
    billId: string;
    currentStage?: "chat" | "summary" | "summary_complete";
  } = await req.json();

  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    return new Response(
      JSON.stringify({
        error: "Anonymous session required",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!billId) {
    return new Response(
      JSON.stringify({
        error: "billId is required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const result = await facilitateInterview({
      messages,
      billId,
      currentStage,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Facilitate interview error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to facilitate interview",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
