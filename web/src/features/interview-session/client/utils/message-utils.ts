import type { InterviewReportViewData } from "../../shared/schemas";

/**
 * 会話メッセージの型定義
 */
export type ConversationMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  report?: InterviewReportViewData | null;
  quickReplies?: string[];
  questionId?: string | null;
};

/**
 * レポートが有効かどうかを判定（空オブジェクトや全てnullの場合はfalse）
 */
export function isValidReport(
  report: InterviewReportViewData | null | undefined
): report is InterviewReportViewData {
  if (!report) return false;
  return !!(
    report.summary ||
    report.stance ||
    report.role ||
    report.role_description ||
    report.opinions.length > 0
  );
}

/**
 * JSONとして保存されたメッセージをパースして、textとreportとquickRepliesに分離する
 */
export function parseMessageContent(content: string): {
  text: string;
  report: InterviewReportViewData | null;
  quickReplies: string[];
  questionId: string | null;
} {
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && parsed !== null && "text" in parsed) {
      const questionId =
        typeof parsed.question_id === "string" && parsed.question_id
          ? parsed.question_id
          : typeof parsed.questionId === "string" && parsed.questionId
            ? parsed.questionId
            : null;
      const rawReport = parsed.report;
      const quickReplies =
        questionId && Array.isArray(parsed.quick_replies)
          ? parsed.quick_replies
          : [];

      if (rawReport) {
        // opinionsがnullの場合は空配列に変換（scoresは除外）
        const report: InterviewReportViewData = {
          summary: rawReport.summary ?? null,
          stance: rawReport.stance ?? null,
          role: rawReport.role ?? null,
          role_description: rawReport.role_description ?? null,
          opinions: rawReport.opinions ?? [],
        };
        return {
          text: parsed.text ?? "",
          report: isValidReport(report) ? report : null,
          quickReplies,
          questionId,
        };
      }
      return {
        text: parsed.text ?? "",
        report: null,
        quickReplies,
        questionId,
      };
    }
  } catch {
    // JSONでない場合はそのままテキストとして扱う
  }
  return { text: content, report: null, quickReplies: [], questionId: null };
}

/**
 * PartialObjectのレポートをInterviewReportViewDataに変換（表示用）
 */
export function convertPartialReport(
  partialReport:
    | {
        summary?: string | null;
        stance?: "for" | "against" | "neutral" | null;
        role?:
          | "subject_expert"
          | "work_related"
          | "daily_life_affected"
          | "general_citizen"
          | null;
        role_description?: string | null;
        opinions?: Array<
          { title?: string; content?: string } | undefined
        > | null;
      }
    | null
    | undefined
): InterviewReportViewData | null {
  if (!partialReport) return null;

  const opinions = partialReport.opinions
    ? partialReport.opinions
        .filter((op): op is NonNullable<typeof op> => op != null)
        .map((op) => ({
          title: op.title ?? "",
          content: op.content ?? "",
        }))
        .filter((op) => op.title || op.content)
    : [];

  const converted: InterviewReportViewData = {
    summary: partialReport.summary ?? null,
    stance: partialReport.stance ?? null,
    role: partialReport.role ?? null,
    role_description: partialReport.role_description ?? null,
    opinions,
  };

  return isValidReport(converted) ? converted : null;
}

/**
 * メッセージ配列をAPI送信用の形式に変換
 */
export function buildMessagesForApi(
  initialMessages: Array<{ role: "assistant" | "user"; content: string }>,
  conversationMessages: Array<{ role: "assistant" | "user"; content: string }>,
  newUserMessage?: string
): Array<{ role: "assistant" | "user"; content: string }> {
  const messages = [
    ...initialMessages.map((m) => ({ role: m.role, content: m.content })),
    ...conversationMessages.map((m) => ({ role: m.role, content: m.content })),
  ];

  if (newUserMessage) {
    messages.push({ role: "user" as const, content: newUserMessage });
  }

  return messages;
}

/** ファシリテーターAPI用のシンプルなメッセージ型 */
export type FacilitatorMessage = {
  role: "assistant" | "user";
  content: string;
};

/**
 * メッセージ配列をファシリテーターAPI用の形式に変換
 */
export function buildMessagesForFacilitator(
  initialMessages: Array<{ role: "assistant" | "user"; content: string }>,
  conversationMessages: Array<{ role: "assistant" | "user"; content: string }>,
  newUserMessage: { content: string }
): FacilitatorMessage[] {
  return [
    ...initialMessages.map((m) => ({ role: m.role, content: m.content })),
    ...conversationMessages.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: newUserMessage.content },
  ];
}
