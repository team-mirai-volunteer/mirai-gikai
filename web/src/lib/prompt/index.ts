import { getLangfuseClient } from "./langfuse/client";
import { LangfusePromptProvider } from "./langfuse/langfuse-prompt-provider";
import type { PromptProvider } from "./interface/prompt-provider";

/**
 * プロンプトプロバイダーの作成処理
 *
 * モック実装を使いたい場合はここに処理を追加する。
 * PromptProviderインターフェースで抽象化されているため、
 * テストやローカル開発用のモック実装に簡単に切り替え可能。
 *
 * モック実装の追加手順：
 * 1. prompt/mock-prompt-provider.ts を作成し、PromptProviderを実装
 * 2. この関数で環境変数に応じて切り替え
 *
 * 例:
 * ```ts
 * if (process.env.USE_MOCK_PROMPTS === "true") {
 *   return new MockPromptProvider();
 * }
 * ```
 */
export function createPromptProvider(): PromptProvider {
  try {
    const client = getLangfuseClient();
    return new LangfusePromptProvider(client);
  } catch (error) {
    console.error("Failed to initialize Langfuse client:", error);
    throw error;
  }
}

export type { CompiledPrompt, PromptVariables } from "./interface/types";
export type { PromptProvider } from "./interface/prompt-provider";
