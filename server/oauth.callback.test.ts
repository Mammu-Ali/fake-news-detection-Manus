import { describe, expect, it, vi } from "vitest";
import { encodeOAuthState, OAUTH_STATE_COOKIE } from "../shared/const";
import { registerOAuthRoutes } from "./_core/oauth";
import { sdk } from "./_core/sdk";

type Handler = (req: any, res: any) => Promise<void>;

function getCallbackHandler() {
  let handler: Handler | undefined;
  registerOAuthRoutes({
    get: (_path: string, route: Handler) => {
      handler = route;
    },
  } as any);
  if (!handler) throw new Error("OAuth callback handler was not registered");
  return handler;
}

function createResponse() {
  return {
    redirects: [] as string[],
    cleared: false,
    redirect(_status: number, location: string) {
      this.redirects.push(location);
    },
    clearCookie() {
      this.cleared = true;
    },
  };
}

describe("OAuth callback recovery", () => {
  it("redirects missing callback parameters to the login error state", async () => {
    const response = createResponse();
    await getCallbackHandler()({ query: {}, headers: {} }, response);
    expect(response.redirects).toEqual(["/login?error=missing_oauth_params"]);
  });

  it("redirects malformed state to the login error state", async () => {
    const response = createResponse();
    await getCallbackHandler()({ query: { code: "code", state: "not-valid-state" }, headers: {} }, response);
    expect(response.redirects).toEqual(["/login?error=invalid_oauth_state"]);
  });

  it("redirects provider exchange failures to the login error state", async () => {
    const state = encodeOAuthState({ redirectUri: "http://localhost:3000/api/oauth/callback", nonce: "test-nonce" });
    const response = createResponse();
    const exchange = vi.spyOn(sdk, "exchangeCodeForToken").mockRejectedValueOnce(new Error("provider unavailable"));

    await getCallbackHandler()({
      query: { code: "code", state },
      headers: { cookie: `${OAUTH_STATE_COOKIE}=test-nonce` },
    }, response);

    expect(response.cleared).toBe(true);
    expect(response.redirects).toEqual(["/login?error=oauth_callback_failed"]);
    exchange.mockRestore();
  });
});
