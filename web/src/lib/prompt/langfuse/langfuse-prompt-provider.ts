import type { Langfuse } from "langfuse";
import type { PromptProvider } from "../interface/prompt-provider";
import type { CompiledPrompt, PromptVariables } from "../interface/types";

export class LangfusePromptProvider implements PromptProvider {
  constructor(private client: Langfuse) {}

  async getPrompt(
    name: string,
    variables?: PromptVariables
  ): Promise<CompiledPrompt> {
    try {
      const fetchedPrompt = await this.client.getPrompt(name);

      const content = fetchedPrompt.compile(variables || {});

      // Vercel AI SDKのtelemetryに渡すメタデータを構築
      const metadata = {
        name: fetchedPrompt.name,
        version: fetchedPrompt.version,
        config: (fetchedPrompt.config || {}) as Record<string, unknown>,
        labels: fetchedPrompt.labels || [],
        tags: fetchedPrompt.tags || [],
      };

      return {
        content,
        metadata,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch prompt "${name}" from Langfuse: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
