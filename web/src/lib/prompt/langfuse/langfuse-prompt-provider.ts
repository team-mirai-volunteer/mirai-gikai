import type { Langfuse } from "langfuse";
import type { PromptProvider } from "../interface/prompt-provider";
import type { CompiledPrompt, PromptVariables } from "../interface/types";
import { env } from "@/lib/env";

export class LangfusePromptProvider implements PromptProvider {
  constructor(private client: Langfuse) {}

  async getPrompt(
    name: string,
    variables?: PromptVariables
  ): Promise<CompiledPrompt> {
    try {
      const fetchedPrompt = await this.client.getPrompt(name, undefined, {
        label: env.langfuse.promptLabel,
      });

      const content = fetchedPrompt.compile(variables || {});

      // Langfuse prompt linkingのためのJSON形式データ
      const metadata = fetchedPrompt.toJSON();

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
