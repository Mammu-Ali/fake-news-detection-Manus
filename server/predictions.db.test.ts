import { describe, expect, it, vi } from "vitest";
import { filterAndSortPredictions, summarizePredictions } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  return {
    user: { id: 12, openId: "db-test-user", name: "DB Test", email: "db@example.com", loginMethod: "oauth", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("prediction data behavior", () => {
  it("aggregates Fake and Real verdicts with percentages", () => {
    const rows = [{ verdict: "Fake" as const, id: 1 }, { verdict: "Fake" as const, id: 2 }, { verdict: "Real" as const, id: 3 }, { verdict: "Real" as const, id: 4 }, { verdict: "Real" as const, id: 5 }];
    expect(summarizePredictions(rows)).toMatchObject({ total: 5, fake: 2, real: 3, fakePercentage: 40, realPercentage: 60 });
    expect(summarizePredictions(rows).recent).toHaveLength(5);
  });

  it("filters representative rows by verdict, confidence, and date, then sorts them", () => {
    const rows = [
      { id: 1, verdict: "Fake" as const, articleText: "urgent claim", confidence: 91, createdAt: new Date("2026-03-01T12:00:00") },
      { id: 2, verdict: "Real" as const, articleText: "verified report", confidence: 82, createdAt: new Date("2026-03-03T12:00:00") },
      { id: 3, verdict: "Fake" as const, articleText: "ordinary story", confidence: 74, createdAt: new Date("2026-03-05T12:00:00") },
    ];
    const result = filterAndSortPredictions(rows, { verdict: "Fake", minConfidence: 70, maxConfidence: 95, from: "2026-03-01", to: "2026-03-04", sort: "confidence" });
    expect(result.map(row => row.id)).toEqual([1]);
  });

  it("passes filtered and sorted history options to the data layer", async () => {
    const listSpy = vi.spyOn(await import("./db"), "listPredictions").mockResolvedValue([]);
    const caller = appRouter.createCaller(context());
    await caller.predictions.list({ search: "alert", sort: "oldest", verdict: "Real", minConfidence: 70, maxConfidence: 99, from: "2026-01-01", to: "2026-12-31" });
    expect(listSpy).toHaveBeenCalledWith(12, expect.objectContaining({ search: "alert", sort: "oldest", verdict: "Real", minConfidence: 70, maxConfidence: 99 }));
    listSpy.mockRestore();
  });

  it("returns the owner deletion result from the protected procedure", async () => {
    const deleteSpy = vi.spyOn(await import("./db"), "deletePrediction").mockResolvedValue(true);
    const caller = appRouter.createCaller(context());
    await expect(caller.predictions.remove({ id: 42 })).resolves.toBe(true);
    expect(deleteSpy).toHaveBeenCalledWith(42, 12);
    deleteSpy.mockRestore();
  });
});
