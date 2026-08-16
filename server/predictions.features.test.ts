import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function authenticatedContext(): TrpcContext {
  return {
    user: { id: 77, openId: "feature-user", name: "Feature User", email: "feature@example.com", loginMethod: "oauth", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("prediction MVP contracts", () => {
  it("accepts verdict, confidence, and date filters for history", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    const rows = await caller.predictions.list({ search: "signal", sort: "confidence", verdict: "Fake", minConfidence: 60, maxConfidence: 99, from: "2026-01-01", to: "2026-12-31" });
    expect(rows).toEqual([]);
  });

  it("returns an empty, stable stats shape for a new user", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    const stats = await caller.predictions.stats();
    expect(stats).toMatchObject({ total: 0, fake: 0, real: 0, fakePercentage: 0, realPercentage: 0, recent: [] });
  });

  it("does not delete a non-positive or malformed prediction id", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    await expect(caller.predictions.remove({ id: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects short article input before invoking the model", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    await expect(caller.predictions.analyze({ articleText: "too short" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
