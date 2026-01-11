export type InterviewMode = "loop" | "bulk";

/**
 * 現在のインタビューモードをハードコードで設定します。
 * - loop: 逐次深掘りモード（通常）
 * - bulk: 一括深掘りモード（事前定義質問を先にすべて消化）
 */
export const GLOBAL_INTERVIEW_MODE: InterviewMode = "loop";
