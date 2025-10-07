import type { Langfuse } from "langfuse";
import type { PromptRepository } from "./repository";
import type { PromptVariables, PromptResult } from "../langfuse/types";

export class LangfusePromptRepository implements PromptRepository {
  constructor(private client: Langfuse) {}

  async getPrompt(
    name: string,
    variables?: PromptVariables
  ): Promise<PromptResult> {
    try {
      // Langfuseからプロンプトを取得
      const fetchedPrompt = await this.client.getPrompt(name);

      // 変数があればコンパイル、なければそのまま使用
      const content = variables
        ? fetchedPrompt.compile(variables)
        : fetchedPrompt.prompt;

      // Vercel AI SDKのtelemetryに渡すメタデータを構築
      const langfuseMetadata = {
        name: fetchedPrompt.name,
        version: fetchedPrompt.version,
        config: fetchedPrompt.config,
        labels: fetchedPrompt.labels || [],
        tags: fetchedPrompt.tags || [],
      };

      return {
        content,
        langfuseMetadata,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch prompt "${name}" from Langfuse: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
