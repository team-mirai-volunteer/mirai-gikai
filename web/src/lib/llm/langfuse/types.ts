/**
 * プロンプトのメタデータ
 * Vercel AI SDKのexperimental_telemetry.metadataに渡す
 */
export interface PromptMetadata {
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
 * コンパイル済みプロンプト
 */
export interface CompiledPrompt {
  /** コンパイル済みプロンプト文字列 */
  content: string;
  /** プロンプトメタデータ（telemetryに渡す） */
  metadata: PromptMetadata;
}
