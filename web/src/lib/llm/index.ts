import { getLangfuseClient } from "./langfuse/client";
import { LangfusePromptRepository } from "./prompt/langfuse-repository";
import type { PromptRepository } from "./prompt/repository";

/**
 * プロンプトリポジトリの作成処理
 *
 * モック実装を使いたい場合はここに処理を追加する。
 * PromptRepositoryインターフェースで抽象化されているため、
 * テストやローカル開発用のモック実装に簡単に切り替え可能。
 *
 * モック実装の追加手順：
 * 1. prompt/mock-repository.ts を作成し、PromptRepositoryを実装
 * 2. この関数で環境変数に応じて切り替え
 *
 * 例:
 * ```ts
 * if (process.env.USE_MOCK_PROMPTS === "true") {
 *   return new MockPromptRepository();
 * }
 * ```
 */
export function createPromptRepository(): PromptRepository {
  try {
    const client = getLangfuseClient();
    return new LangfusePromptRepository(client);
  } catch (error) {
    console.error("Failed to initialize Langfuse client:", error);
    throw error;
  }
}

export type {
  CompiledPrompt,
  PromptMetadata,
  PromptVariables,
} from "./langfuse/types";
export type { PromptRepository } from "./prompt/repository";
