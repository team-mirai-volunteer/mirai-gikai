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

  async getUsageCostUsd(
    userId: string,
    from: string,
    to: string
  ): Promise<number> {
    try {
      const query = this.buildMetricsQuery(userId, from, to);
      const response = await this.client.api.metricsMetrics({
        query: JSON.stringify(query),
      });

      const totalCost = this.extractCostValue(response?.data);

      if (totalCost === null) {
        throw new Error("Failed to extract cost value from Langfuse response");
      }

      return totalCost;
    } catch (error) {
      // Responseオブジェクトの場合、bodyを読み取ってエラー詳細を表示
      if (error && typeof error === "object" && "status" in error) {
        const response = error as Response;
        const errorBody = await response.text();
        throw new Error(
          `Failed to fetch usage cost from Langfuse (${response.status}): ${errorBody}`
        );
      }

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
