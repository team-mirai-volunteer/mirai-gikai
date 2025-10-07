export interface PromptMetadata {
  name: string;
  version: number;
  config: Record<string, unknown>;
  labels: string[];
  tags: string[];
}

export interface PromptVariables {
  [key: string]: string;
}

export interface CompiledPrompt {
  content: string;
  metadata: PromptMetadata;
}
