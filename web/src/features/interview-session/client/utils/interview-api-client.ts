import type { InterviewStage } from "@/features/interview-session/shared/schemas";
import type { SimpleMessage } from "./message-utils";

/**
 * @deprecated InterviewStage は schemas.ts から直接インポートしてください。
 */
export type { InterviewStage } from "@/features/interview-session/shared/schemas";

/** @deprecated */
interface FacilitateInterviewParams {
  messages: SimpleMessage[];
  billId: string;
  currentStage: InterviewStage;
}

/** @deprecated */
interface FacilitateInterviewResult {
  nextStage: InterviewStage;
  source: "algorithm" | "llm";
  next_question_id?: string;
}

/**
 * @deprecated この関数は非推奨です。
 * ファシリテーション判定は /api/interview/chat のバックエンドで統合されました。
 * レスポンスの next_stage フィールドを使用してステージ遷移を判定してください。
 * この関数は後方互換性のために残されていますが、将来のバージョンで削除される予定です。
 */
export async function callFacilitateApi(
  params: FacilitateInterviewParams
): Promise<FacilitateInterviewResult | null> {
  try {
    const res = await fetch("/api/interview/facilitate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      return (await res.json()) as FacilitateInterviewResult;
    }
    return null;
  } catch (err) {
    console.error("facilitate interview failed:", err);
    return null;
  }
}

interface CompleteInterviewParams {
  sessionId: string;
}

interface CompleteInterviewResult {
  report?: {
    id: string;
  };
}

/**
 * インタビュー完了APIを呼び出して、レポートをDBに保存
 */
export async function callCompleteApi(
  params: CompleteInterviewParams
): Promise<CompleteInterviewResult> {
  const res = await fetch("/api/interview/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to complete interview");
  }

  return (await res.json()) as CompleteInterviewResult;
}
