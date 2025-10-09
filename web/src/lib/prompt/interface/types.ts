export interface PromptVariables {
  [key: string]: string;
}

export interface CompiledPrompt {
  content: string;
  metadata: string;
}
