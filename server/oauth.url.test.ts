import { describe, expect, it } from "vitest";
import { buildOAuthLoginUrl } from "../shared/const";

describe("OAuth login URL", () => {
  it("uses the provider login route and preserves the OAuth contract", () => {
    const url = new URL(buildOAuthLoginUrl({
      oauthPortalUrl: "https://manus.im/",
      appId: "app-123",
      redirectUri: "https://example.test/api/oauth/callback",
      state: "encoded-state",
    }));

    expect(url.origin).toBe("https://manus.im");
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("appId")).toBe("app-123");
    expect(url.searchParams.get("redirectUri")).toBe("https://example.test/api/oauth/callback");
    expect(url.searchParams.get("state")).toBe("encoded-state");
    expect(url.searchParams.get("type")).toBe("signIn");
  });
});

