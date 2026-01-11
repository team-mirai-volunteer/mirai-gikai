import { parseMessageContent } from "../../client/utils/message-utils";
import type { InterviewQuestion } from "../../shared/types";

/**
 * 次に聞くべき質問IDを算出する
 */
export function calculateNextQuestionId(
  messages: Array<{ role: string; content: string }>,
  questions: InterviewQuestion[]
): string | undefined {
  // すでに聞いた質問IDを収集
  const askedQuestionIds = new Set<string>();
  for (const m of messages) {
    if (m.role === "assistant") {
      const { questionId } = parseMessageContent(m.content);
      if (questionId) {
        askedQuestionIds.add(questionId);
      }
    }
  }

  // 次に聞くべき質問を特定（未回答の最初の質問）
  const nextUnasked = questions.find((q) => !askedQuestionIds.has(q.id));
  return nextUnasked?.id;
}
