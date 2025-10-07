"use server";

import { ensureAnonymousUser } from "../server/anonymous-auth";
import { ensureTokenUsageRecord } from "../server/token-usage";

export async function fetchTokenUsage() {
  const { userId } = await ensureAnonymousUser();
  const usage = await ensureTokenUsageRecord(userId);

  return {
    userId,
    usage,
    isRateLimited: usage.tokenRemaining <= 0,
  } as const;
}

