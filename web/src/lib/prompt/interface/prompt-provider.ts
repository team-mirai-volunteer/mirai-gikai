import type { CompiledPrompt, PromptVariables } from "./types";

export interface PromptProvider {
  getPrompt(name: string, variables?: PromptVariables): Promise<CompiledPrompt>;

  /**
   * 指定ユーザーの指定期間のコスト使用量をUSDで取得
   * @param userId - ユーザーID
   * @param from - 開始日時（ISO 8601形式）
   * @param to - 終了日時（ISO 8601形式）
   * @returns コスト使用量（USD）
   * @throws Langfuseからのデータ取得に失敗した場合
   */
  getUsageCostUsd(userId: string, from: string, to: string): Promise<number>;
}
