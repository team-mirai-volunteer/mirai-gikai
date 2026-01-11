import "server-only";

import type { BillWithContent } from "@/features/bills/shared/types";
import type { getInterviewConfig } from "@/features/interview-config/server/loaders/get-interview-config";
import type { getInterviewQuestions } from "@/features/interview-config/server/loaders/get-interview-questions";
import type { FacilitatorMessage } from "../../../client/utils/message-utils";

/**
 * システムプロンプト構築用パラメータ
 */
export interface InterviewPromptParams {
  bill: BillWithContent | null;
  interviewConfig: Awaited<ReturnType<typeof getInterviewConfig>>;
  questions: Awaited<ReturnType<typeof getInterviewQuestions>>;
  nextQuestionId?: string;
}

/**
 * インタビュー質問の型
 */
export type InterviewQuestion = Awaited<
  ReturnType<typeof getInterviewQuestions>
>[number];

/**
 * DBメッセージの型
 */
export interface DbMessage {
  id: string;
  interview_session_id: string;
  role: "assistant" | "user";
  content: string;
  created_at: string;
}

/**
 * ファシリテーター用パラメータ
 */
export interface FacilitatorParams {
  messages: FacilitatorMessage[];
  currentStage: "chat" | "summary" | "summary_complete";
  questions: InterviewQuestion[];
  askedQuestionIds: Set<string>;
  dbMessages: DbMessage[];
  totalQuestions: number;
  completedQuestions: number;
  remainingQuestions: number;
}

/**
 * ファシリテーター結果の型
 */
export interface FacilitatorResult {
  nextStage: "chat" | "summary" | "summary_complete";
  source: "algorithm" | "llm";
}

/**
 * モードの実装インターフェース
 *
 * 各モード（bulk, loop）はこのインターフェースを実装する
 * 1ファイルを見れば、そのモードの全ロジックを把握できる
 */
export interface InterviewModeLogic {
  /**
   * システムプロンプトを構築
   */
  buildSystemPrompt(params: InterviewPromptParams): string;

  /**
   * インタビューの進行を判定
   * @returns nextStageとsourceを含む結果。アルゴリズムで判定できる場合はsource: "algorithm"
   *          LLMによる判定が必要な場合はnullを返し、呼び出し元でLLMを呼び出す
   */
  checkProgress(params: FacilitatorParams): FacilitatorResult | null;

  /**
   * ファシリテーター用のプロンプトを構築
   */
  buildFacilitatorPrompt(params: FacilitatorParams): string;
}
