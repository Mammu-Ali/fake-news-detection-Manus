import { describe, expect, it, vi } from "vitest";
import * as adminDb from "./adminDb";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeContext(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: role === "admin" ? 1 : 2, openId: `${role}-admin-test`, name: role, email: `${role}@example.com`, loginMethod: "oauth", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin dashboard authorization", () => {
  it("rejects regular users from dataset management", async () => {
    const caller = appRouter.createCaller(makeContext("user"));
    await expect(caller.admin.datasets.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects regular users from metric management", async () => {
    const caller = appRouter.createCaller(makeContext("user"));
    await expect(caller.admin.metrics.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows admins to read the dataset and metric registries", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));
    await expect(caller.admin.datasets.list()).resolves.toBeDefined();
    await expect(caller.admin.metrics.list()).resolves.toBeDefined();
  });

  it("covers dataset create, archive, and delete success paths", async () => {
    const createSpy = vi.spyOn(adminDb, "createDataset").mockResolvedValue(501);
    const archiveSpy = vi.spyOn(adminDb, "archiveDataset").mockResolvedValue(true);
    const deleteSpy = vi.spyOn(adminDb, "deleteDataset").mockResolvedValue(true);
    const caller = appRouter.createCaller(makeContext("admin"));
    await expect(caller.admin.datasets.create({ name: "Corpus", description: "labels", fileName: "corpus.txt", fileContentBase64: "YQ==", recordCount: 1, fakeCount: 1, realCount: 0, version: "v1" })).resolves.toBe(501);
    await expect(caller.admin.datasets.archive({ id: 501 })).resolves.toBe(true);
    await expect(caller.admin.datasets.remove({ id: 501 })).resolves.toBe(true);
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ uploadedBy: 1, fileContentBase64: "YQ==" }));
    expect(archiveSpy).toHaveBeenCalledWith(501);
    expect(deleteSpy).toHaveBeenCalledWith(501);
    createSpy.mockRestore(); archiveSpy.mockRestore(); deleteSpy.mockRestore();
  });

  it("validates evaluation percentages", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));
    await expect(caller.admin.metrics.create({ modelName: "LSTM", datasetName: "Corpus", accuracy: 101, precision: 90, recall: 90, f1Score: 90, truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
