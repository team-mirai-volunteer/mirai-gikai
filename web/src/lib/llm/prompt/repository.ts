import type { CompiledPrompt, PromptVariables } from "../langfuse/types";

export interface PromptRepository {
  getPrompt(name: string, variables?: PromptVariables): Promise<CompiledPrompt>;
}
