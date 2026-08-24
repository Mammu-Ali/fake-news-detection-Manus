import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("runtime auth configuration", () => {
  it("reports OAuth availability from the server environment", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousAppId = process.env.VITE_APP_ID;
    const previousPortalUrl = process.env.VITE_OAUTH_PORTAL_URL;
    process.env.NODE_ENV = "development";
    process.env.VITE_APP_ID = "test-app-id";
    process.env.VITE_OAUTH_PORTAL_URL = "https://oauth.example.test";

    try {
      const config = await appRouter.createCaller(publicContext()).auth.config();
      expect(config).toEqual({
        appId: "test-app-id",
        oauthPortalUrl: "https://oauth.example.test",
        localDemoEnabled: true,
      });
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
      process.env.VITE_APP_ID = previousAppId;
      process.env.VITE_OAUTH_PORTAL_URL = previousPortalUrl;
    }
  });

  it("never reports local demo mode in production", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      const config = await appRouter.createCaller(publicContext()).auth.config();
      expect(config.localDemoEnabled).toBe(false);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });
});
