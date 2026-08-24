import { describe, expect, it, vi } from "vitest";

const invokeLLM = vi.hoisted(() => vi.fn());
vi.mock("./_core/llm", () => ({ invokeLLM }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const articleText = "This representative article contains enough text to exercise the guest classification flow safely.";

const modelResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        verdict: "Fake",
        confidence: 91,
        explanation: "The article uses urgency and weak sourcing. This is a pattern-based result, not verified facts.",
        linguisticPatterns: "Urgent wording and absolute claims.",
        emotionalTone: "Fear-oriented and sensational.",
        credibilitySignals: "No named source or supporting study.",
        highlightedPhrases: ["urgent claim"],
        signals: ["Urgency", "Weak sourcing"],
      }),
    },
  }],
};

describe("guest analysis", () => {
  it("allows unauthenticated analysis and returns an ephemeral result", async () => {
    invokeLLM.mockResolvedValueOnce(modelResponse);
    const result = await appRouter.createCaller(publicContext()).predictions.guestAnalyze({ articleText });

    expect(result).toMatchObject({ verdict: "Fake", confidence: 91, processingTimeMs: expect.any(Number) });
    expect(invokeLLM).toHaveBeenCalledTimes(1);
  });

  it("rejects short guest input before invoking the model", async () => {
    invokeLLM.mockClear();
    const caller = appRouter.createCaller(publicContext());

    await expect(caller.predictions.guestAnalyze({ articleText: "too short" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("keeps authenticated persistence protected separately", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.predictions.analyze({ articleText })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
