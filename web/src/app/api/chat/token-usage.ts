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

