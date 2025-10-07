import { getLangfuseClient } from "./langfuse/client";
import { LangfusePromptRepository } from "./prompt/langfuse-repository";
import type { PromptRepository } from "./prompt/repository";

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
  LangfusePromptMetadata,
  PromptResult,
  PromptVariables,
} from "./langfuse/types";
export type { PromptRepository } from "./prompt/repository";
