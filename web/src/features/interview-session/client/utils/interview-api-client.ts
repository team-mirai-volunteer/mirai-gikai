import type { FacilitatorMessage } from "./message-utils";

export type InterviewStage = "chat" | "summary" | "summary_complete";

interface FacilitateInterviewParams {
  messages: FacilitatorMessage[];
  billId: string;
  currentStage: InterviewStage;
}

interface FacilitateInterviewResult {
  nextStage: InterviewStage;
  source: "algorithm" | "llm";
  next_question_id?: string;
}

/**
 * ファシリテーターAPIを呼び出して、インタビューの進行状況を判定
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
