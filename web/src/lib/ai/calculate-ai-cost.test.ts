import { describe, expect, it } from "vitest";

import {
  calculateUsageCostUsd,
  modelPricing,
  roundCost,
  type SanitizedUsage,
  sanitizeUsage,
} from "./calculate-ai-cost";

describe("calculateUsageCostUsd", () => {
  it("returns 0 when usage has no tokens", () => {
    const usage: SanitizedUsage = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };

    expect(calculateUsageCostUsd("openai/gpt-4o", usage)).toBe(0);
  });

  it("calculates cost for known model", () => {
    const usage: SanitizedUsage = {
      inputTokens: 500,
      outputTokens: 1000,
      totalTokens: 1500,
    };

    const expectedInput =
      (modelPricing["openai/gpt-4o"].inputTokensPerMillionUsd *
        usage.inputTokens) /
      1_000_000;
    const expectedOutput =
      (modelPricing["openai/gpt-4o"].outputTokensPerMillionUsd *
        usage.outputTokens) /
      1_000_000;

    expect(calculateUsageCostUsd("openai/gpt-4o", usage)).toBe(
      roundCost(expectedInput + expectedOutput)
    );
  });

  it("throws for unknown model", () => {
    const usage: SanitizedUsage = {
      inputTokens: 1000,
      outputTokens: 1000,
      totalTokens: 2000,
    };

    expect(() => calculateUsageCostUsd("unknown-model", usage)).toThrow(
      'Unknown pricing for model "unknown-model"'
    );
  });

  it("accepts custom pricing maps", () => {
    const usage: SanitizedUsage = {
      inputTokens: 1000,
      outputTokens: 2000,
      totalTokens: 3000,
    };

    const customPricing = {
      "custom-model": {
        inputTokensPerMillionUsd: 1,
        outputTokensPerMillionUsd: 2,
      },
    } satisfies Record<
      string,
      { inputTokensPerMillionUsd: number; outputTokensPerMillionUsd: number }
    >;

    const expected = roundCost(
      (1 * usage.inputTokens + 2 * usage.outputTokens) / 1_000_000
    );

    expect(calculateUsageCostUsd("custom-model", usage, customPricing)).toBe(
      expected
    );
  });
});

describe("sanitizeUsage", () => {
  it("handles null usage", () => {
    expect(sanitizeUsage(null)).toEqual({
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    });
  });

  it("uses provided input/output tokens", () => {
    const usage = sanitizeUsage({
      inputTokens: 100,
      outputTokens: 200,
      totalTokens: 0,
    });

    expect(usage).toEqual({
      inputTokens: 100,
      outputTokens: 200,
      totalTokens: 300,
    });
  });

  it("splits total tokens when input/output missing", () => {
    const usage = sanitizeUsage({ totalTokens: 5 } as any);

    expect(usage).toEqual({ inputTokens: 2, outputTokens: 3, totalTokens: 5 });
  });
});
