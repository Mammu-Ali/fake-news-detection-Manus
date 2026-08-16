import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function unauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("prediction access rules", () => {
  it("requires authentication for dashboard statistics", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.predictions.stats()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires authentication before article analysis", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.predictions.analyze({ articleText: "This article contains enough text to exercise the protected validation path." })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
