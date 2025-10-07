import type { PromptVariables, PromptResult } from "../langfuse/types";

export interface PromptRepository {
  /**
   * プロンプトを取得する
   * @param name プロンプト名
   * @param variables テンプレート変数
   * @throws Error プロンプト取得失敗時
   */
  getPrompt(name: string, variables?: PromptVariables): Promise<PromptResult>;
}
