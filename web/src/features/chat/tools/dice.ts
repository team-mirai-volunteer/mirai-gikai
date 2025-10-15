import { tool } from "ai";
import { z } from "zod";

/**
 * 1から6までのランダムな数を返すサイコロツール
 * Web検索などの複雑なツールとは独立してテスト可能
 */
export const diceTool = tool({
  description: "1から6までのランダムな数字を返すサイコロを振ります",
  inputSchema: z.object({
    count: z
      .number()
      .int()
      .min(1)
      .max(10)
      .default(1)
      .describe("サイコロを振る回数（1〜10回）"),
  }),
  execute: async ({ count }) => {
    console.log(`[DiceTool] Rolling dice ${count} time(s)...`);

    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * 6) + 1;
      results.push(roll);
    }

    console.log(`[DiceTool] Results:`, results);

    return {
      rolls: results,
      total: results.reduce((sum, val) => sum + val, 0),
      count,
    };
  },
});
