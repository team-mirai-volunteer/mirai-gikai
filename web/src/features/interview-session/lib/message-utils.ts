import type { InterviewReportData } from "../types/schemas";

/**
 * 会話メッセージの型定義
 */
export type ConversationMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  report?: InterviewReportData | null;
  quickReplies?: string[];
};

/**
 * レポートが有効かどうかを判定（空オブジェクトや全てnullの場合はfalse）
 */
export function isValidReport(
  report: InterviewReportData | null | undefined
): report is InterviewReportData {
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
  report: InterviewReportData | null;
  quickReplies: string[];
} {
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && parsed !== null && "text" in parsed) {
      const rawReport = parsed.report;
      const quickReplies = Array.isArray(parsed.quick_replies)
        ? parsed.quick_replies
        : [];

      if (rawReport) {
        // opinionsがnullの場合は空配列に変換
        const report: InterviewReportData = {
          ...rawReport,
          opinions: rawReport.opinions ?? [],
        };
        return {
          text: parsed.text ?? "",
          report: isValidReport(report) ? report : null,
          quickReplies,
        };
      }
      return { text: parsed.text ?? "", report: null, quickReplies };
    }
  } catch {
    // JSONでない場合はそのままテキストとして扱う
  }
  return { text: content, report: null, quickReplies: [] };
}

/**
 * PartialObjectのレポートをInterviewReportDataに変換
 */
export function convertPartialReport(
  partialReport:
    | {
        summary?: string | null;
        stance?: "for" | "against" | "neutral" | null;
        role?: string | null;
        role_description?: string | null;
        opinions?: Array<
          { title?: string; content?: string } | undefined
        > | null;
      }
    | null
    | undefined
): InterviewReportData | null {
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

  const converted: InterviewReportData = {
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
