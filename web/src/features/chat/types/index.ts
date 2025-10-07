export interface TokenUsage {
  tokenLimit: number;
  tokenUsed: number;
  tokenRemaining: number;
}

export interface TokenUsageCheckResult {
  canUse: boolean;
  usage: TokenUsage;
  error?: string;
}

export interface TokenUsageUpdatePayload {
  inputTokens: number;
  outputTokens: number;
}

export interface TokenUsageLogEntry {
  userId: string;
  tokenUsed: number;
  tokenLimit: number;
  tokenRemaining: number;
}

export interface ChatRateLimitError {
  status: number;
  message: string;
}

