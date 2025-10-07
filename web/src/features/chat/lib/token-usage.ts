import type { LanguageModelUsage } from "ai";

export function logTokenUsage(totalUsage?: LanguageModelUsage | null) {
  const { inputTokens, outputTokens, totalTokens } = totalUsage ?? {};

  console.log(
    JSON.stringify({
      event: "ai-chat-usage",
      inputTokens,
      outputTokens,
      totalTokens,
    })
  );
}

export function getTokensUsed(totalUsage?: LanguageModelUsage | null) {
  if (!totalUsage) return 0;

  const totalTokens = totalUsage.totalTokens ?? 0;
  const input = totalUsage.inputTokens ?? 0;
  const output = totalUsage.outputTokens ?? 0;

  if (totalTokens) return totalTokens;

  const tokensUsed = input + output;

  return Number.isFinite(tokensUsed) ? tokensUsed : 0;
}
