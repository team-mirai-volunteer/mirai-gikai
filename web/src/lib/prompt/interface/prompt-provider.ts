import type { CompiledPrompt, PromptVariables } from "./types";

export interface PromptProvider {
  getPrompt(name: string, variables?: PromptVariables): Promise<CompiledPrompt>;
}
