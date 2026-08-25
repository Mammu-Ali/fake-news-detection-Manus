import { describe, expect, it, vi } from "vitest";
import { appRouter, normalizeAnalysis } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

const invokeLLM = vi.hoisted(() => vi.fn());
vi.mock("./_core/llm", () => ({ invokeLLM }));

const articleText = "This representative article contains enough text to exercise the authenticated analysis workflow safely.";

const validModelResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        verdict: "Fake",
        confidence: 88,
        explanation: "Urgent wording and weak sourcing indicate a pattern-based concern, not verified facts.",
        linguisticPatterns: "Absolute claims and urgency cues.",
        emotionalTone: "Fear-oriented and sensational.",
        credibilitySignals: "No named source or supporting study.",
        highlightedPhrases: ["share immediately"],
        signals: ["Urgency", "Weak sourcing"],
      }),
    },
  }],
};

function context(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const signedInUser = {
  id: 21,
  openId: "analysis-user",
  name: "Analysis User",
  email: "analysis@example.com",
  loginMethod: "oauth",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("article analysis feature", () => {
  it("returns a complete result for an authenticated article and persists only the owner’s record", async () => {
    invokeLLM.mockResolvedValueOnce(validModelResponse);
    const createSpy = vi.spyOn(db, "createPrediction").mockResolvedValueOnce(501);

    const result = await appRouter.createCaller(context(signedInUser)).predictions.analyze({ articleText: `  ${articleText}  ` });

    expect(result).toMatchObject({ verdict: "Fake", confidence: 88, processingTimeMs: expect.any(Number) });
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      userId: 21,
      articleText,
      verdict: "Fake",
      confidence: 88,
      highlightedPhrases: JSON.stringify(["share immediately"]),
      signals: JSON.stringify(["Urgency", "Weak sourcing"]),
    }));
    createSpy.mockRestore();
  });

  it("rejects empty, whitespace-only, short, and oversized article input before model invocation", async () => {
    invokeLLM.mockClear();
    const caller = appRouter.createCaller(context(signedInUser));
    const cases = ["", " ".repeat(80), "x".repeat(39), "x".repeat(20_001)];

    for (const invalidArticleText of cases) {
      await expect(caller.predictions.analyze({ articleText: invalidArticleText })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("normalizes out-of-range confidence and filters malformed array members", () => {
    const result = normalizeAnalysis({
      verdict: "Real",
      confidence: -10,
      explanation: "A valid explanation.",
      linguisticPatterns: "Neutral.",
      emotionalTone: "Neutral.",
      credibilitySignals: "Named source.",
      highlightedPhrases: ["first", 42, "second", null],
      signals: ["one", "two", 99],
    });

    expect(result.confidence).toBe(1);
    expect(result.highlightedPhrases).toEqual(["first", "second"]);
    expect(result.signals).toEqual(["one", "two"]);
  });

  it("returns the model failure instead of fabricating a successful API response", async () => {
    invokeLLM.mockRejectedValueOnce(new Error("model unavailable"));
    const caller = appRouter.createCaller(context());

    await expect(caller.predictions.guestAnalyze({ articleText })).rejects.toThrow("model unavailable");
  });

  it("propagates a persistence failure instead of reporting a saved analysis", async () => {
    invokeLLM.mockResolvedValueOnce(validModelResponse);
    const createSpy = vi.spyOn(db, "createPrediction").mockRejectedValueOnce(new Error("database unavailable"));

    await expect(appRouter.createCaller(context(signedInUser)).predictions.analyze({ articleText })).rejects.toThrow("database unavailable");
    createSpy.mockRestore();
  });

  it("propagates a history API/database failure to the caller", async () => {
    const listSpy = vi.spyOn(db, "listPredictions").mockRejectedValueOnce(new Error("history database unavailable"));

    await expect(appRouter.createCaller(context(signedInUser)).predictions.list({})).rejects.toThrow("history database unavailable");
    listSpy.mockRestore();
  });

  it("blocks authenticated analysis and history from unauthenticated callers", async () => {
    const caller = appRouter.createCaller(context());

    await expect(caller.predictions.analyze({ articleText })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.predictions.list({})).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.predictions.stats()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("keeps guest analysis ephemeral and available without authentication", async () => {
    invokeLLM.mockResolvedValueOnce(validModelResponse);
    const createSpy = vi.spyOn(db, "createPrediction");

    const result = await appRouter.createCaller(context()).predictions.guestAnalyze({ articleText });

    expect(result).toMatchObject({ verdict: "Fake", confidence: 88 });
    expect(createSpy).not.toHaveBeenCalled();
    createSpy.mockRestore();
  });
});
