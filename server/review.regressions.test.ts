import { describe, expect, it } from "vitest";
import { buildOAuthLoginUrl, getOAuthStateCookieName } from "../shared/const";
import { appRouter, normalizeAnalysis } from "./routers";
import { filterAndSortPredictions, getUtcDateBounds } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";

function request(protocol: "http" | "https", headers: Record<string, string> = {}) {
  return { protocol, headers } as any;
}

function userContext(role: "user" | "admin" = "user") {
  return { user: { id: 7, openId: "review-user", role }, req: request("https"), res: {} } as any;
}

describe("review regression contracts", () => {
  it("keeps malformed model responses structured and bounded", () => {
    const result = normalizeAnalysis({
      verdict: "Fake",
      confidence: 999,
      explanation: "pattern-based explanation",
      linguisticPatterns: "urgency",
      emotionalTone: "fear",
      credibilitySignals: "weak sourcing",
      highlightedPhrases: ["valid", 42, null, "second", "third", "fourth", "ignored"],
      signals: ["one", 42, "two", null, "three", "ignored"],
    });

    expect(result).toMatchObject({
      verdict: "Fake",
      confidence: 99,
      highlightedPhrases: ["valid", "second", "third", "fourth", "ignored"],
      signals: ["one", "two", "three", "ignored"],
    });
  });

  it("returns a safe complete shape for non-object model output", () => {
    const result = normalizeAnalysis("not-json");

    expect(result.verdict === "Fake" || result.verdict === "Real").toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(1);
    expect(result.confidence).toBeLessThanOrEqual(99);
    expect(result.highlightedPhrases.length).toBeGreaterThan(0);
    expect(result.signals.length).toBeGreaterThanOrEqual(2);
    expect(result.explanation).toContain("pattern-based");
  });

  it("uses a secure nonce cookie only for HTTPS OAuth transport", () => {
    expect(getOAuthStateCookieName(true)).toBe("__Host-oauth_state");
    expect(getOAuthStateCookieName(false)).toBe("oauth_state");

    const secure = getSessionCookieOptions(request("https"));
    const insecure = getSessionCookieOptions(request("http"));
    expect(secure).toMatchObject({ secure: true, sameSite: "none", httpOnly: true });
    expect(insecure).toMatchObject({ secure: false, sameSite: "lax", httpOnly: true });
  });

  it("recognizes forwarded HTTPS without trusting a non-HTTPS request", () => {
    expect(getSessionCookieOptions(request("http", { "x-forwarded-proto": "https" }))).toMatchObject({ secure: true, sameSite: "none" });
    expect(getSessionCookieOptions(request("http", { "x-forwarded-proto": "http" }))).toMatchObject({ secure: false, sameSite: "lax" });
  });

  it("uses half-open UTC date bounds so the end date includes its full calendar day", () => {
    const bounds = getUtcDateBounds({ from: "2026-08-25", to: "2026-08-25" });
    expect(bounds.from?.toISOString()).toBe("2026-08-25T00:00:00.000Z");
    expect(bounds.toExclusive?.toISOString()).toBe("2026-08-26T00:00:00.000Z");

    const rows = [
      { verdict: "Fake" as const, confidence: 70, articleText: "at start", createdAt: new Date("2026-08-25T00:00:00.000Z") },
      { verdict: "Real" as const, confidence: 40, articleText: "at end", createdAt: new Date("2026-08-25T23:59:59.999Z") },
      { verdict: "Fake" as const, confidence: 80, articleText: "outside", createdAt: new Date("2026-08-26T00:00:00.000Z") },
    ];
    expect(filterAndSortPredictions(rows, { from: "2026-08-25", to: "2026-08-25" }).map(row => row.articleText)).toEqual(["at end", "at start"]);
  });

  it("rejects invalid dataset extensions and oversized encoded uploads", async () => {
    const caller = appRouter.createCaller(userContext("admin"));
    const base = { name: "Dataset", description: "", recordCount: 1, fakeCount: 1, realCount: 0, version: "v1" };

    await expect(caller.admin.datasets.create({ ...base, fileName: "dataset.csv" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.admin.datasets.create({ ...base, fileName: "dataset.txt", fileContentBase64: "!not-base64" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.admin.datasets.create({ ...base, fileName: "dataset.txt", fileContentBase64: "A".repeat(16_000_001) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("keeps protected prediction mutations unavailable without a user", async () => {
    const caller = appRouter.createCaller({ user: null, req: request("https"), res: {} } as any);
    await expect(caller.predictions.remove({ id: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.predictions.analyze({ articleText: "This article contains enough text to satisfy the validation boundary for this protected mutation." })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("builds a normalized provider login URL with exact callback parameters", () => {
    const url = new URL(buildOAuthLoginUrl({
      oauthPortalUrl: "https://manus.im///",
      appId: "app-123",
      redirectUri: "https://example.test/api/oauth/callback",
      state: "nonce-state",
    }));

    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("appId")).toBe("app-123");
    expect(url.searchParams.get("redirectUri")).toBe("https://example.test/api/oauth/callback");
    expect(url.searchParams.get("state")).toBe("nonce-state");
    expect(url.searchParams.get("type")).toBe("signIn");
  });
});

