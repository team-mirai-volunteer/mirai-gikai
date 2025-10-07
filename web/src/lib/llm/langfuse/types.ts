/**
 * Langfuseプロンプトのメタデータ
 * Vercel AI SDKのexperimental_telemetry.metadata.langfusePromptに渡す
 */
export interface LangfusePromptMetadata {
  name: string;
  version: number;
  config: Record<string, unknown>;
  labels: string[];
  tags: string[];
}

/**
 * プロンプトテンプレート変数
 */
export interface PromptVariables {
  [key: string]: string | number | boolean;
}

/**
 * プロンプト取得結果
 */
export interface PromptResult {
  /** コンパイル済みプロンプト文字列 */
  content: string;
  /** Langfuseメタデータ（telemetryに渡す） */
  langfuseMetadata: LangfusePromptMetadata;
}
