import type { Langfuse } from "langfuse";
import type { PromptProvider } from "../interface/prompt-provider";
import type { CompiledPrompt, PromptVariables } from "../interface/types";

export class LangfusePromptProvider implements PromptProvider {
  constructor(private client: Langfuse) {}

  async getPrompt(
    name: string,
    variables?: PromptVariables
  ): Promise<CompiledPrompt> {
    console.log(`[Langfuse] Fetching prompt:`, {
      name,
      hasVariables: !!variables,
      variableKeys: variables ? Object.keys(variables) : [],
    });

    try {
      const fetchedPrompt = await this.client.getPrompt(name);
      console.log(`[Langfuse] Prompt fetched successfully:`, {
        name,
        promptVersion: fetchedPrompt.version,
      });

      const content = fetchedPrompt.compile(variables || {});
      console.log(`[Langfuse] Prompt compiled:`, {
        name,
        contentLength: content.length,
      });

      // Langfuse prompt linkingのためのJSON形式データ
      const metadata = fetchedPrompt.toJSON();

      return {
        content,
        metadata,
      };
    } catch (error) {
      console.error(`[Langfuse] Failed to fetch prompt:`, {
        name,
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to fetch prompt "${name}" from Langfuse: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getUsageCostUsd(
    userId: string,
    from: string,
    to: string
  ): Promise<number> {
    console.log(`[Langfuse] Fetching usage cost:`, {
      userId,
      from,
      to,
    });

    try {
      const query = this.buildMetricsQuery(userId, from, to);
      console.log(`[Langfuse] Metrics query:`, query);

      const response = await this.client.api.metricsMetrics({
        query: JSON.stringify(query),
      });
      console.log(`[Langfuse] Metrics response received:`, {
        dataLength: response?.data?.length,
      });

      const totalCost = this.extractCostValue(response?.data);

      if (totalCost === null) {
        console.error(`[Langfuse] Failed to extract cost value:`, {
          responseData: response?.data,
        });
        throw new Error("Failed to extract cost value from Langfuse response");
      }

      console.log(`[Langfuse] Usage cost calculated:`, {
        userId,
        totalCost,
      });

      return totalCost;
    } catch (error) {
      // Responseオブジェクトの場合、bodyを読み取ってエラー詳細を表示
      if (error && typeof error === "object" && "status" in error) {
        const response = error as Response;
        const errorBody = await response.text();
        console.error(`[Langfuse] API error:`, {
          status: response.status,
          body: errorBody,
        });
        throw new Error(
          `Failed to fetch usage cost from Langfuse (${response.status}): ${errorBody}`
        );
      }

      console.error(`[Langfuse] Usage cost fetch error:`, {
        error,
        message: error instanceof Error ? error.message : String(error),
      });

      throw new Error(
        `Failed to fetch usage cost from Langfuse: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private buildMetricsQuery(userId: string, from: string, to: string) {
    return {
      view: "observations",
      metrics: [
        {
          measure: "totalCost",
          aggregation: "sum",
        },
      ],
      filters: [
        {
          column: "userId",
          operator: "=",
          value: userId,
          type: "string",
        },
        {
          column: "type",
          operator: "=",
          value: "GENERATION",
          type: "string",
        },
      ],
      fromTimestamp: from,
      toTimestamp: to,
    } satisfies Record<string, unknown>;
  }

  private extractCostValue(
    data: Record<string, unknown>[] | undefined
  ): number | null {
    // レスポンス形式: [{ sum_totalCost: number | null }]
    const sumTotalCost = data?.[0]?.sum_totalCost;

    // 数値が返ってきた場合はそのまま返す
    if (typeof sumTotalCost === "number") {
      return sumTotalCost;
    }

    // nullまたはundefinedの場合は0を返す（使用量がない）
    if (sumTotalCost === null || sumTotalCost === undefined) {
      return 0;
    }

    // 予期しない型の場合はnullを返してエラーにする
    return null;
  }
}
